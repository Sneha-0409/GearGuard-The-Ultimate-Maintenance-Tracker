const Equipment = require('../models/Equipment');
const TelemetryData = require('../models/TelemetryData');
const MaintenanceRequest = require('../models/MaintenanceRequest');

const SIMULATION_INTERVAL_MS = 10000; // Every 10 seconds to not overwhelm the database in dev
const Z_SCORE_THRESHOLD = 3;
const EMA_ALPHA = 0.2; // Smoothing factor for EMA (higher = adapts faster to recent data)

// In-memory stats for Z-score calculation (EMA and EMVar)
// Key: EquipmentId_MetricType
const statsCache = new Map();

function getStats(key, baselineValue) {
  if (!statsCache.has(key)) {
    // Initialize with baseline. Assume standard deviation starts at a small percentage of baseline or a minimum.
    statsCache.set(key, {
      ema: baselineValue,
      emvar: baselineValue * 0.05 // Initial small variance
    });
  }
  return statsCache.get(key);
}

function updateStats(key, newValue) {
  const stats = statsCache.get(key);
  
  // Calculate variance before updating EMA
  const diff = newValue - stats.ema;
  const emvar = (1 - EMA_ALPHA) * (stats.emvar + EMA_ALPHA * diff * diff);
  const ema = stats.ema + EMA_ALPHA * diff;
  
  statsCache.set(key, { ema, emvar });
  
  const stdDev = Math.sqrt(emvar);
  const zScore = stdDev === 0 ? 0 : Math.abs(newValue - ema) / stdDev;
  
  return { ema, stdDev, zScore };
}

let ioRef = null;

const startTelemetryIngest = (io) => {
  ioRef = io;
  console.log('📡 Starting IoT Telemetry Ingestion Pipeline (Runs every 10s)...');
  
  setInterval(async () => {
    try {
      // 1. Fetch active equipment
      const equipments = await Equipment.find({ status: 'active' });
      
      const telemetryDocs = [];
      
      for (const eq of equipments) {
        // Randomly decide if we generate normal data or an anomaly (e.g., 2% chance of anomaly per tick per machine)
        const isAnomaly = Math.random() < 0.02;
        
        // --- TEMPERATURE ---
        const baseTemp = eq.temperatureCelsius || 45; // default fallback
        // Normal variance +/- 2 degrees, anomaly adds 15-25 degrees
        const tempVariance = (Math.random() - 0.5) * 4;
        const tempValue = baseTemp + tempVariance + (isAnomaly ? (15 + Math.random() * 10) : 0);
        
        // --- VIBRATION ---
        const baseVib = eq.vibrationAmplitude || 0.5; // default fallback
        const vibVariance = (Math.random() - 0.5) * 0.2;
        const vibValue = baseVib + vibVariance + (isAnomaly ? (1.5 + Math.random()) : 0);
        
        telemetryDocs.push(
          { metadata: { equipmentId: eq._id, metricType: 'temperature' }, value: tempValue },
          { metadata: { equipmentId: eq._id, metricType: 'vibration' }, value: vibValue }
        );

        // 3. Process Statistical Deviation
        const tempKey = `${eq._id}_temperature`;
        const vibKey = `${eq._id}_vibration`;
        
        getStats(tempKey, baseTemp);
        getStats(vibKey, baseVib);
        
        const tempStats = updateStats(tempKey, tempValue);
        const vibStats = updateStats(vibKey, vibValue);

        // 4. Action Automation: Check Thresholds
        // Make sure we only alert if there's an actual anomaly spike, not just normal variance
        if (isAnomaly && tempStats.zScore > Z_SCORE_THRESHOLD) {
          await triggerPredictiveAlert(eq, 'temperature', tempValue, tempStats.zScore, tempStats.ema);
        }
        
        if (isAnomaly && vibStats.zScore > Z_SCORE_THRESHOLD) {
          await triggerPredictiveAlert(eq, 'vibration', vibValue, vibStats.zScore, vibStats.ema);
        }
      }

      // 2. Save Telemetry in bulk
      if (telemetryDocs.length > 0) {
        await TelemetryData.insertMany(telemetryDocs);
      }
    } catch (err) {
      console.error('❌ Telemetry Ingestion Error:', err);
    }
  }, SIMULATION_INTERVAL_MS);
};

const triggerPredictiveAlert = async (equipment, metricType, value, zScore, ema) => {
  // Check if an active predictive alert already exists to prevent spam
  const existingAlert = await MaintenanceRequest.findOne({
    equipmentId: equipment._id,
    type: 'predictive',
    stage: { $nin: ['repaired', 'scrap'] }
  });

  if (existingAlert) return; // Already an active alert

  // Generate a random Request Number
  const requestNumber = `PRD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  const newRequest = new MaintenanceRequest({
    requestNumber,
    subject: `[PREDICTIVE ALERT] Anomaly detected in ${metricType}`,
    description: `IoT sensor array detected a statistical anomaly. \n\nMetric: ${metricType.toUpperCase()} \nCurrent Value: ${value.toFixed(2)} \nBaseline (EMA): ${ema.toFixed(2)} \nZ-Score: ${zScore.toFixed(2)} standard deviations. \n\nImmediate inspection is required.`,
    type: 'predictive',
    stage: 'new',
    priority: 'urgent',
    equipmentId: equipment._id,
    teamId: equipment.maintenanceTeamId,
    assignedToId: equipment.defaultTechnicianId || null,
    scheduledDate: new Date()
  });

  await newRequest.save();

  console.log(`⚠️ Predictive Alert Generated for ${equipment.name} (${metricType})`);

  // Optional: Send Real-Time Socket Notification
  if (ioRef) {
    ioRef.emit('predictive_alert', {
      equipmentName: equipment.name,
      metricType,
      value: value.toFixed(2),
      zScore: zScore.toFixed(2),
      requestId: newRequest._id
    });
  }
};

module.exports = { startTelemetryIngest };
