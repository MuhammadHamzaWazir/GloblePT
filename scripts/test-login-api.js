const https = require('https');

console.log('🧪 Testing login API directly...');

const postData = JSON.stringify({
  email: 'admin@test.com',
  password: 'admin123'
});

const options = {
  hostname: 'globalpharmatrading.co.uk',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);

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

req.write(postData);
req.end();
