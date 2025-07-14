const https = require('https');

function testAPI(path, description) {
  console.log(`\n=== Testing ${description} ===`);
  
  const options = {
    hostname: 'pharmacy-management-system-pibw4kq2f.vercel.app',
    port: 443,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Success - Page loaded correctly');
        if (data.includes('Authentication Required')) {
          console.log('❌ Vercel authentication is enabled');
        } else if (data.includes('<!DOCTYPE html>') || data.includes('<html')) {
          console.log('✅ HTML page returned');
        } else {
          console.log('📄 Response preview:', data.substring(0, 200) + '...');
        }
      } else if (res.statusCode === 401) {
        console.log('❌ 401 - Authentication required (Vercel protection enabled)');
      } else {
        console.log(`❌ HTTP ${res.statusCode} error`);
        console.log('Response preview:', data.substring(0, 200) + '...');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.end();
}

// Test different endpoints
console.log('Testing Vercel deployment accessibility...');

testAPI('/', 'Homepage');
setTimeout(() => testAPI('/api/health', 'Health API'), 1000);
setTimeout(() => testAPI('/api/admin/pending-users', 'Pending Users API'), 2000);
