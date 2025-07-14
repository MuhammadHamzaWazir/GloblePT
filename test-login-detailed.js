const https = require('https');

function testDetailedLogin() {
  console.log('=== Testing Detailed Login Process ===');
  
  // Test with different scenarios
  const testCases = [
    {
      name: 'Empty request',
      data: {}
    },
    {
      name: 'Invalid JSON structure',
      data: { invalidField: 'test' }
    },
    {
      name: 'Valid structure but invalid credentials',
      data: { email: 'test@example.com', password: 'wrongpassword' }
    },
    {
      name: 'Valid structure with SQL injection attempt',
      data: { email: "admin' OR '1'='1", password: 'test' }
    }
  ];

  testCases.forEach((testCase, index) => {
    setTimeout(() => {
      console.log(`\n--- Test Case ${index + 1}: ${testCase.name} ---`);
      
      const postData = JSON.stringify(testCase.data);
      
      const options = {
        hostname: 'globalpharmatrading.co.uk',
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
        console.log(`Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const responseData = JSON.parse(data);
            console.log('Response:', JSON.stringify(responseData, null, 2));
            
            if (res.statusCode === 500) {
              console.log('❌ Internal Server Error detected!');
            } else if (res.statusCode === 401) {
              console.log('✅ Expected authentication error');
            } else if (res.statusCode === 400) {
              console.log('✅ Expected validation error');
            }
          } catch (e) {
            console.log('Raw response:', data);
            if (data.includes('Internal Server Error')) {
              console.log('❌ HTML error page detected - potential server issue');
            }
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

      req.write(postData);
      req.end();
      
    }, index * 2000);
  });
}

// Test database health via a simple API endpoint
function testDatabaseHealth() {
  setTimeout(() => {
    console.log('\n=== Testing Database Health ===');
    
    const options = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/api/debug',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Database health check status: ${res.statusCode}`);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Database response:', data.substring(0, 500));
      });
    });

    req.on('error', (error) => {
      console.error('❌ Database health check failed:', error.message);
    });

    req.end();
  }, 10000);
}

console.log('Starting comprehensive login testing...');
testDetailedLogin();
testDatabaseHealth();
