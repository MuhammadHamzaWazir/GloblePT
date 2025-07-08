// Test live API endpoints to diagnose the 401 error
const https = require('https');

const LIVE_DOMAIN = 'globalpharmatrading.co.uk';
const VERCEL_URL = 'pharmacy-management-system-nph9m7bln.vercel.app';

console.log('🔍 DIAGNOSING API ENDPOINT ISSUES\n');
console.log(`🌐 Testing both domains:`);
console.log(`   - Custom domain: ${LIVE_DOMAIN}`);
console.log(`   - Vercel URL: ${VERCEL_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

function makeRequest(hostname, path, method = 'GET', headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: hostname,
      port: 443,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'API-Test/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testEndpoint(hostname, path, expectedStatus = 200) {
  try {
    console.log(`📡 Testing: https://${hostname}${path}`);
    const response = await makeRequest(hostname, path);
    
    const status = response.statusCode === expectedStatus ? '✅' : '❌';
    console.log(`   ${status} Status: ${response.statusCode} (expected: ${expectedStatus})`);
    
    if (response.statusCode !== expectedStatus) {
      console.log(`   📄 Response: ${response.data.substring(0, 200)}${response.data.length > 200 ? '...' : ''}`);
    }
    
    return response.statusCode === expectedStatus;
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function runDiagnostics() {
  const testCases = [
    // Basic connectivity
    { path: '/', expectedStatus: 200, description: 'Home page' },
    { path: '/auth/login', expectedStatus: 200, description: 'Login page' },
    
    // API endpoints that should work without auth
    { path: '/api/auth/me', expectedStatus: 401, description: 'Auth check (should be 401 without login)' },
    
    // The problematic endpoint
    { path: '/api/users/profile/', expectedStatus: 401, description: 'User profile (should be 401 without login)' },
    { path: '/api/users/profile', expectedStatus: 401, description: 'User profile without trailing slash' },
  ];

  for (const domain of [LIVE_DOMAIN, VERCEL_URL]) {
    console.log(`\n🔍 Testing ${domain}:`);
    console.log('─'.repeat(50));
    
    let allPassed = true;
    for (const test of testCases) {
      const passed = await testEndpoint(domain, test.path, test.expectedStatus);
      if (!passed) allPassed = false;
      console.log(`   📝 ${test.description}`);
    }
    
    console.log(`\n📊 Overall result for ${domain}: ${allPassed ? '✅ WORKING' : '❌ ISSUES FOUND'}`);
  }

  // Test specific login flow
  console.log('\n\n🔐 TESTING LOGIN FLOW:');
  console.log('─'.repeat(50));
  
  try {
    console.log('1️⃣ Testing login endpoint...');
    const loginResponse = await makeRequest(LIVE_DOMAIN, '/api/auth/login', 'POST', {
      'Content-Type': 'application/json'
    });
    
    console.log(`   📡 Login POST status: ${loginResponse.statusCode}`);
    
    if (loginResponse.headers['set-cookie']) {
      console.log('   🍪 Cookies would be set on successful login');
    }
    
    // Test with invalid credentials to see if endpoint is working
    const testLoginData = JSON.stringify({
      email: 'test@test.com',
      password: 'wrongpassword'
    });
    
    const loginTest = await new Promise((resolve, reject) => {
      const options = {
        hostname: LIVE_DOMAIN,
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(testLoginData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        }));
      });

      req.on('error', reject);
      req.write(testLoginData);
      req.end();
    });
    
    console.log(`   📡 Login with test credentials: ${loginTest.statusCode}`);
    console.log(`   📄 Response: ${loginTest.data.substring(0, 100)}...`);
    
  } catch (error) {
    console.log(`   ❌ Login test error: ${error.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 DIAGNOSIS SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('• The 401 error on /api/users/profile/ is EXPECTED when not logged in');
  console.log('• This suggests the API endpoints are working correctly');
  console.log('• The issue is likely in the frontend authentication flow');
  console.log('• User needs to login first, then access /dashboard/profile/');
  console.log('\n💡 NEXT STEPS:');
  console.log('1. Visit https://globalpharmatrading.co.uk/auth/login');
  console.log('2. Login with valid credentials');
  console.log('3. Then try accessing https://globalpharmatrading.co.uk/dashboard/profile/');
  console.log('4. If still getting 401, check if nuclear cookie deletion is clearing auth cookies too aggressively');
}

runDiagnostics();
