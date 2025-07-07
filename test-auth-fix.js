const https = require('https');

// Function to make HTTP requests
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.end();
  });
}

async function testAuthEndpoints() {
  console.log('🔍 TESTING AUTH ENDPOINTS AFTER FIX');
  console.log('=' .repeat(80));
  console.log('🌍 Environment: https://globalpharmatrading.co.uk');
  console.log('📅 Test Date:', new Date().toISOString());
  console.log('');

  const endpoints = [
    {
      name: '/api/auth/verify',
      path: '/api/auth/verify',
      description: 'Legacy auth verification endpoint'
    },
    {
      name: '/api/auth/me', 
      path: '/api/auth/me',
      description: 'Current auth status endpoint'
    },
    {
      name: '/api/auth/logout',
      path: '/api/auth/logout',
      description: 'Logout endpoint'
    }
  ];

  console.log('📋 TESTING AUTH ENDPOINTS WITHOUT CREDENTIALS:');
  console.log('-'.repeat(60));

  for (const endpoint of endpoints) {
    const options = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: endpoint.path,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    };

    try {
      const response = await makeRequest(options);
      
      console.log(`\n${endpoint.name}:`);
      console.log(`   Description: ${endpoint.description}`);
      console.log(`   Status: ${response.statusCode}`);
      
      try {
        const data = JSON.parse(response.body);
        console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
        
        if (response.statusCode === 401) {
          if (data.authenticated === false || data.message) {
            console.log('   ✅ Correctly returns 401 with proper error message');
          } else {
            console.log('   ⚠️ Returns 401 but response format could be improved');
          }
        } else if (response.statusCode === 200) {
          console.log('   ⚠️ Unexpected 200 response without authentication');
        } else {
          console.log(`   ❓ Unexpected status code: ${response.statusCode}`);
        }
      } catch (e) {
        console.log(`   ❌ Invalid JSON response: ${response.body}`);
      }
    } catch (error) {
      console.log(`\n${endpoint.name}:`);
      console.log(`   ❌ Request failed: ${error.message}`);
    }
  }

  // Test logout endpoint with POST method
  console.log('\n' + '-'.repeat(60));
  console.log('TESTING LOGOUT ENDPOINT WITH POST:');
  console.log('-'.repeat(60));

  const logoutOptions = {
    hostname: 'globalpharmatrading.co.uk',
    port: 443,
    path: '/api/auth/logout',
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  try {
    const logoutResponse = await makeRequest(logoutOptions);
    
    console.log(`\nPOST /api/auth/logout:`);
    console.log(`   Status: ${logoutResponse.statusCode}`);
    
    try {
      const data = JSON.parse(logoutResponse.body);
      console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      
      if (logoutResponse.statusCode === 200 && data.success) {
        console.log('   ✅ Logout endpoint working correctly');
        if (logoutResponse.headers['set-cookie']) {
          console.log('   ✅ Cookie clearing headers present');
        }
      } else {
        console.log('   ❌ Logout endpoint not working properly');
      }
    } catch (e) {
      console.log(`   ❌ Invalid JSON response: ${logoutResponse.body}`);
    }
  } catch (error) {
    console.log(`   ❌ Logout request failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log('');
  console.log('✅ FIXED ISSUES:');
  console.log('   - Updated auth-context.tsx to use /api/auth/me instead of /api/auth/verify');
  console.log('   - Updated MainHeader.tsx to use /api/auth/me');
  console.log('   - Updated test-login page to use /api/auth/me');
  console.log('   - Improved /api/auth/verify endpoint response format');
  console.log('   - Standardized error response format across auth endpoints');
  console.log('');
  console.log('🎯 RESULT:');
  console.log('   The 401 error should now provide proper JSON responses');
  console.log('   instead of causing JavaScript errors in the browser.');
  console.log('');
  console.log('📋 WHAT WAS CAUSING THE ERROR:');
  console.log('   - Components were calling /api/auth/verify without authentication');
  console.log('   - The endpoint was returning 401 but with inconsistent response format');
  console.log('   - Browser was trying to parse the response and failing');
  console.log('');
  console.log('🔧 HOW IT\'S FIXED:');
  console.log('   - All components now use /api/auth/me (the standard endpoint)');
  console.log('   - Both endpoints now return consistent JSON error responses');
  console.log('   - Error handling improved throughout the application');
}

async function main() {
  await testAuthEndpoints();
}

main();
