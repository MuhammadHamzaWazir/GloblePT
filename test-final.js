const https = require('https');

function finalTest() {
  console.log('=== Final Comprehensive Test ===');
  console.log('Testing globalpharmatrading.co.uk for any current issues...\n');
  
  // Test different scenarios that might cause intermittent errors
  const tests = [
    {
      name: 'Basic Homepage Load',
      path: '/',
      method: 'GET'
    },
    {
      name: 'Login Page Load',
      path: '/auth/login',
      method: 'GET'
    },
    {
      name: 'Empty Login Request',
      path: '/api/auth/login',
      method: 'POST',
      data: '{}'
    },
    {
      name: 'Malformed JSON',
      path: '/api/auth/login', 
      method: 'POST',
      data: '{'
    },
    {
      name: 'Large Request',
      path: '/api/auth/login',
      method: 'POST',
      data: JSON.stringify({
        email: 'test@example.com',
        password: 'a'.repeat(1000), // Large password
        extraData: 'x'.repeat(5000)
      })
    },
    {
      name: 'Valid Login Structure',
      path: '/api/auth/login',
      method: 'POST', 
      data: JSON.stringify({
        email: 'admin@example.com',
        password: 'validformat123'
      })
    }
  ];

  tests.forEach((test, index) => {
    setTimeout(() => {
      console.log(`--- ${test.name} ---`);
      
      const options = {
        hostname: 'globalpharmatrading.co.uk',
        port: 443,
        path: test.path,
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      if (test.data) {
        options.headers['Content-Length'] = Buffer.byteLength(test.data);
      }

      const req = https.request(options, (res) => {
        console.log(`Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 500) {
            console.log('❌ INTERNAL SERVER ERROR DETECTED!');
            console.log('Error response:', data.substring(0, 400));
          } else if (res.statusCode === 200) {
            console.log('✅ Success');
          } else if (res.statusCode === 401) {
            console.log('✅ Expected auth error');
          } else if (res.statusCode === 400) {
            console.log('✅ Expected validation error');
            try {
              const parsed = JSON.parse(data);
              console.log('Error type:', parsed.message);
            } catch (e) {
              console.log('Raw error:', data.substring(0, 100));
            }
          } else {
            console.log(`⚠️  Unexpected status: ${res.statusCode}`);
            console.log('Response:', data.substring(0, 200));
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Network error:', error.message);
      });

      req.setTimeout(15000, () => {
        console.error('❌ Request timeout (15s)');
        req.destroy();
      });

      if (test.data) {
        req.write(test.data);
      }
      
      req.end();
      
    }, index * 3000);
  });
}

console.log('Running final comprehensive test to check for any intermittent issues...');
finalTest();
