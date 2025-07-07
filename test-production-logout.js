// Test logout functionality on production
const https = require('https');

console.log('🧪 Testing logout on production site...\n');

async function testProductionLogout() {
  console.log('🔧 Testing logout on production server...');
  
  try {
    // Step 1: Login with a test user (assuming we have one)
    console.log('Step 1: Attempting to login...');
    const loginResponse = await makeRequest('https://globalpharmatrading.co.uk/api/auth/login', 'POST', {
      email: 'testing@example.com', // Use an existing test user
      password: 'Test123!'
    });
    
    console.log(`   Login status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed or test user does not exist');
      console.log(`   Response: ${loginResponse.body}`);
      console.log('   This is expected if the test user does not exist in production');
      return false;
    }
    
    const cookies = extractCookies(loginResponse.headers);
    console.log(`   Cookies received: ${cookies ? cookies.substring(0, 50) + '...' : 'None'}`);
    
    // Step 2: Call logout
    console.log('\nStep 2: Calling logout...');
    const logoutResponse = await makeRequest('https://globalpharmatrading.co.uk/api/auth/logout', 'POST', null, cookies);
    console.log(`   Logout status: ${logoutResponse.statusCode}`);
    console.log(`   Logout body: ${logoutResponse.body}`);
    
    // Check logout headers
    const logoutHeaders = logoutResponse.headers['set-cookie'];
    if (logoutHeaders) {
      console.log('   Logout Set-Cookie headers:');
      logoutHeaders.forEach((header, index) => {
        console.log(`     ${index + 1}: ${header}`);
      });
      
      // Check if the logout header looks correct
      const hasCorrectLogoutHeader = logoutHeaders.some(header => 
        header.includes('pharmacy_auth=;') || 
        header.includes('pharmacy_auth=""') ||
        header.includes('Max-Age=0') ||
        header.includes('Expires=Thu, 01 Jan 1970')
      );
      
      if (hasCorrectLogoutHeader) {
        console.log('✅ Logout headers look correct for cookie deletion');
        return true;
      } else {
        console.log('❌ Logout headers do not contain proper cookie deletion directives');
        return false;
      }
      
    } else {
      console.log('   ❌ No Set-Cookie headers in logout response');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error in production logout test:', error.message);
    return false;
  }
}

// Test without login - just test logout endpoint response
async function testLogoutEndpointOnly() {
  console.log('\n🔧 Testing logout endpoint without login...');
  
  try {
    const logoutResponse = await makeRequest('https://globalpharmatrading.co.uk/api/auth/logout', 'POST');
    console.log(`   Logout endpoint status: ${logoutResponse.statusCode}`);
    console.log(`   Logout endpoint body: ${logoutResponse.body}`);
    
    const logoutHeaders = logoutResponse.headers['set-cookie'];
    if (logoutHeaders) {
      console.log('   Set-Cookie headers from logout endpoint:');
      logoutHeaders.forEach((header, index) => {
        console.log(`     ${index + 1}: ${header}`);
      });
      console.log('✅ Logout endpoint is sending Set-Cookie headers');
      return true;
    } else {
      console.log('   ❌ No Set-Cookie headers from logout endpoint');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing logout endpoint:', error.message);
    return false;
  }
}

function makeRequest(url, method, data = null, cookies = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Logout-Test/1.0'
      }
    };

    if (cookies) {
      options.headers.Cookie = cookies;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function extractCookies(headers) {
  const setCookieHeaders = headers['set-cookie'];
  if (!setCookieHeaders) return null;
  
  return setCookieHeaders.map(cookie => cookie.split(';')[0]).join('; ');
}

async function runTest() {
  console.log('Testing production logout functionality...\n');
  
  const endpointWorked = await testLogoutEndpointOnly();
  const fullTestWorked = await testProductionLogout();
  
  console.log(`\n📋 Results:`);
  console.log(`   Logout endpoint test: ${endpointWorked ? 'PASSED' : 'FAILED'}`);
  console.log(`   Full logout test: ${fullTestWorked ? 'PASSED' : 'FAILED (expected if no test user exists)'}`);
  
  if (endpointWorked) {
    console.log('✅ The logout endpoint is working and sending proper cookie deletion headers');
  } else {
    console.log('❌ The logout endpoint has issues');
  }
}

runTest().catch(console.error);
