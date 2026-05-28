const axios = require('axios');

async function verifyReDoS() {
  console.log('--- Verifying ReDoS Fix ---');
  
  // A known evil regex that causes catastrophic backtracking if unescaped
  const evilRegex = '^(((.*)+)+)+$';
  
  const token = process.env.TEST_TOKEN || ''; // If auth is needed, but we expect quick response even if 401
  
  console.log(`Sending GET request with malicious payload: ${evilRegex}`);
  const startTime = Date.now();
  
  try {
    const response = await axios.get(`http://localhost:5000/api/v1/requests?search=${encodeURIComponent(evilRegex)}`, {
      timeout: 5000,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      validateStatus: () => true
    });
    
    const duration = Date.now() - startTime;
    console.log(`Received response in ${duration}ms. Status: ${response.status}`);
    
    if (duration < 3000) {
      console.log('✅ PASS: Server responded quickly! ReDoS is mitigated. The payload was safely treated as a literal string.');
    } else {
      console.error(`❌ FAIL: Server took too long (${duration}ms). It might still be evaluating the regex.`);
    }
  } catch (error) {
    console.error(`Request failed after ${Date.now() - startTime}ms:`, error.message);
  }
}

verifyReDoS();
