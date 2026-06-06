const { mongoose } = require('../config/database');
const { Schema } = mongoose;

const OrganizationSchema = new Schema({
  name: { type: String, required: true, trim: true },
  billingStatus: { type: String, enum: ['active', 'past_due', 'suspended', 'trial'], default: 'trial' },
  createdAt: { type: Date, default: Date.now }
});

// Since we are using a global plugin to inject tenantId into all models, 
// we specifically want to prevent the Organization model from receiving a tenantId
OrganizationSchema.statics.isTenantAware = false;

module.exports = mongoose.model('Organization', OrganizationSchema);
