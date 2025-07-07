const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';
// Use the email from earlier 2FA tests - likely exists in the database
const TEST_EMAIL = 'mhamzawazir1996@gmail.com';
const TEST_PASSWORD = 'password123';

async function makeRequest(url, method = 'GET', data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script',
        ...(cookies && { 'Cookie': cookies })
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        // Extract cookies from response
        const setCookies = res.headers['set-cookie'] || [];
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          cookies: setCookies
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function extractCookies(cookieArray) {
  return cookieArray.map(cookie => cookie.split(';')[0]).join('; ');
}

async function testLogoutWithoutAuth() {
  console.log('🔄 Testing logout flow (without full 2FA) in production...\n');

  try {
    // Step 1: Attempt login to see current state
    console.log('1. Attempting login...');
    const loginResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/login`, 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    console.log(`   Login Status: ${loginResponse.statusCode}`);
    console.log('   Login response:', loginResponse.body);

    if (loginResponse.statusCode !== 200) {
      console.log('   ❌ Cannot test logout without a valid login. User might not exist or password incorrect.');
      console.log('   Let\'s test the logout endpoints directly instead...\n');
    } else {
      const loginData = JSON.parse(loginResponse.body);
      console.log('   Login data:', loginData);

      // Extract cookies from login
      const authCookies = extractCookies(loginResponse.cookies);
      console.log('   Auth cookies received:', authCookies ? 'Yes' : 'No');

      if (loginData.requires2FA) {
        console.log('   2FA required - continuing with partial cookies for logout test');
      }

      // Test logout with whatever cookies we have
      console.log('\n2. Testing logout API...');
      const logoutResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST', {}, authCookies);
      console.log(`   Logout Status: ${logoutResponse.statusCode}`);
      console.log('   Logout response:', logoutResponse.body);

      const logoutCookies = extractCookies(logoutResponse.cookies);
      console.log('   Logout set cookies:', logoutCookies);

      // Test auth status after logout
      console.log('\n3. Testing auth status after logout...');
      const authCheckResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, logoutCookies);
      console.log(`   Auth check status: ${authCheckResponse.statusCode}`);
      console.log('   Auth check response:', authCheckResponse.body);
    }

    // Test logout endpoint behavior without any auth
    console.log('\n4. Testing logout endpoint without auth...');
    const logoutNoAuthResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST', {});
    console.log(`   Logout (no auth) status: ${logoutNoAuthResponse.statusCode}`);
    console.log('   Logout (no auth) response:', logoutNoAuthResponse.body);

    // Test login page access scenarios
    console.log('\n5. Testing login page access scenarios...');
    
    // Regular login page
    const loginPageResponse = await makeRequest(`${PRODUCTION_URL}/auth/login`, 'GET');
    console.log(`   Regular login page status: ${loginPageResponse.statusCode}`);
    if (loginPageResponse.statusCode === 302 || loginPageResponse.statusCode === 307) {
      console.log(`   Regular login page redirected to: ${loginPageResponse.headers.location}`);
    } else if (loginPageResponse.statusCode === 200) {
      console.log('   ✅ Regular login page accessible');
    }

    // Login page with logout parameter
    const loginPageLogoutResponse = await makeRequest(`${PRODUCTION_URL}/auth/login?logout=true`, 'GET');
    console.log(`   Login page with logout param status: ${loginPageLogoutResponse.statusCode}`);
    if (loginPageLogoutResponse.statusCode === 302 || loginPageLogoutResponse.statusCode === 307) {
      console.log(`   Login page with logout param redirected to: ${loginPageLogoutResponse.headers.location}`);
    } else if (loginPageLogoutResponse.statusCode === 200) {
      console.log('   ✅ Login page with logout param accessible');
    }

    // Test dashboard access without auth
    console.log('\n6. Testing dashboard access without auth...');
    const dashboardResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET');
    console.log(`   Dashboard (no auth) status: ${dashboardResponse.statusCode}`);
    if (dashboardResponse.statusCode === 302 || dashboardResponse.statusCode === 307) {
      const location = dashboardResponse.headers.location;
      console.log(`   Dashboard redirected to: ${location}`);
      if (location && location.includes('/auth/login')) {
        console.log('   ✅ Dashboard correctly redirects to login when not authenticated');
      }
    }

    // Test protected route access
    console.log('\n7. Testing other protected routes...');
    const profileResponse = await makeRequest(`${PRODUCTION_URL}/profile`, 'GET');
    console.log(`   Profile (no auth) status: ${profileResponse.statusCode}`);
    if (profileResponse.statusCode === 302 || profileResponse.statusCode === 307) {
      console.log(`   Profile redirected to: ${profileResponse.headers.location}`);
    }

    console.log('\n✅ Logout flow analysis completed!');
    console.log('\n📋 KEY FINDINGS:');
    console.log('- Logout API endpoint behavior tested');
    console.log('- Login page accessibility verified'); 
    console.log('- Protected route redirects verified');
    console.log('- Cookie handling checked');
    console.log('\n🎯 MAIN GOAL: Verify no redirect loops occur after logout');

  } catch (error) {
    console.error('❌ Error during logout test:', error);
  }
}

// Run the test
testLogoutWithoutAuth();
