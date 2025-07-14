const https = require('https');

function testCurrentDeployment() {
  console.log('=== Testing Current Production Deployment ===');
  
  // Test the newest deployment
  const hostname = 'pharmacy-management-system-oifsfoclx.vercel.app';
  
  const testPaths = [
    { path: '/', name: 'Homepage' },
    { path: '/auth/login', name: 'Login Page' },
    { path: '/api/auth/login', name: 'Login API', method: 'POST' }
  ];

  testPaths.forEach((test, index) => {
    setTimeout(() => {
      console.log(`\n--- Testing ${test.name} ---`);
      
      let options = {
        hostname: hostname,
        port: 443,
        path: test.path,
        method: test.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      const req = https.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Success');
          } else if (res.statusCode === 401) {
            if (data.includes('Authentication Required')) {
              console.log('❌ Vercel protection enabled');
            } else {
              console.log('✅ Expected authentication response');
            }
          } else if (res.statusCode === 400) {
            console.log('✅ Expected validation error');
          } else if (res.statusCode === 500) {
            console.log('❌ Internal Server Error');
            console.log('Error details:', data.substring(0, 300));
          }
          
          // Show response for POST requests
          if (test.method === 'POST') {
            console.log('Response:', data.substring(0, 200));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
      });

      // For POST requests, send empty body
      if (test.method === 'POST') {
        req.write('{}');
      }
      
      req.end();
      
    }, index * 2000);
  });
}

console.log('Testing the latest deployment...');
testCurrentDeployment();
