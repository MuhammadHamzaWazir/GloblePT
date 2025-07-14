const https = require('https');

console.log('🧪 Testing environment debug endpoint...');

const options = {
  hostname: 'globalpharmatrading.co.uk',
  port: 443,
  path: '/api/debug-env',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📄 Response:', data);
    try {
      const parsed = JSON.parse(data);
      console.log('📊 Parsed response:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('⚠️ Could not parse as JSON:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.end();
