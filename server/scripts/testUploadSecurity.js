const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('--- Testing Unauthenticated Upload ---');
  try {
    const form = new FormData();
    // Use an existing file to upload, e.g., this very script
    form.append('attachments', fs.createReadStream(__filename), {
      filename: '../../../malicious-test-file.js',
      contentType: 'image/jpeg'
    });

    const response = await axios.post(`${API_URL}/upload/attachments`, form, {
      headers: form.getHeaders(),
      validateStatus: () => true
    });

    if (response.status === 401 || response.status === 403 || (response.data && response.data.error === 'Not authorized, no token')) {
      console.log('✅ PASS: Unauthenticated request rejected (401).');
    } else {
      console.error(`❌ FAIL: Unauthenticated request returned status ${response.status}`);
      console.error(response.data);
    }
  } catch (error) {
    console.error('Error during unauthenticated test:', error.message);
  }

  // To fully test the authenticated upload and path traversal block, 
  // we would need a valid JWT token. 
  // For now, the successful block of unauthenticated request is the primary fix to confirm.
}

runTest();
