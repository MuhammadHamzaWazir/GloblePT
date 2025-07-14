const https = require('https');

function testAPI(hostname, path, description) {
  console.log(`\n=== Testing ${description} ===`);
  console.log(`URL: https://${hostname}${path}`);
  
  const options = {
    hostname: hostname,
    port: 443,
    path: path,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, JSON.stringify(res.headers, null, 2));
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n--- Response Body ---');
      if (res.statusCode === 200) {
        console.log('✅ Success - Page loaded correctly');
        if (data.includes('<!DOCTYPE html>') || data.includes('<html')) {
          console.log('✅ HTML page returned');
          if (data.includes('Login')) {
            console.log('✅ Login page detected');
          }
        } else {
          console.log('📄 Response preview:', data.substring(0, 300) + '...');
        }
      } else if (res.statusCode === 401) {
        console.log('❌ 401 - Authentication required');
        if (data.includes('Authentication Required')) {
          console.log('❌ Vercel protection is enabled');
        }
      } else if (res.statusCode === 500) {
        console.log('❌ 500 - Internal Server Error');
        console.log('Error response:', data.substring(0, 500));
      } else if (res.statusCode === 404) {
        console.log('❌ 404 - Not Found');
      } else {
        console.log(`❌ HTTP ${res.statusCode} error`);
        console.log('Response preview:', data.substring(0, 300) + '...');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.setTimeout(10000, () => {
    console.error('❌ Request timeout');
    req.destroy();
  });

  req.end();
}

function testLoginAPI(hostname) {
  console.log(`\n=== Testing Login API POST ===`);
  console.log(`URL: https://${hostname}/api/auth/login`);
  
  const postData = JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword'
  });
  
  const options = {
    hostname: hostname,
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response:', data);
      if (res.statusCode === 401) {
        console.log('✅ API is working - Invalid credentials (expected)');
      } else if (res.statusCode === 500) {
        console.log('❌ Internal server error in API');
      } else if (res.statusCode === 404) {
        console.log('❌ API endpoint not found');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.write(postData);
  req.end();
}

console.log('Testing custom domain and login functionality...');

// Test the custom domain
testAPI('globalpharmatrading.co.uk', '/', 'Custom Domain Homepage');
setTimeout(() => testAPI('globalpharmatrading.co.uk', '/auth/login', 'Custom Domain Login Page'), 2000);
setTimeout(() => testLoginAPI('globalpharmatrading.co.uk'), 4000);

// Compare with Vercel URL
setTimeout(() => testAPI('pharmacy-management-system-pibw4kq2f.vercel.app', '/', 'Vercel Homepage'), 6000);
setTimeout(() => testAPI('pharmacy-management-system-pibw4kq2f.vercel.app', '/auth/login', 'Vercel Login Page'), 8000);
