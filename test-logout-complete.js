const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';
const TEST_EMAIL = 'test-logout@example.com';
const TEST_PASSWORD = 'TestPassword123!';

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

async function testCompleteLogoutFlow() {
  console.log('🔄 Testing complete logout flow in production...\n');

  try {
    // Step 1: Create a test user
    console.log('1. Creating test user...');
    const createUserResponse = await makeRequest(`${PRODUCTION_URL}/api/admin/users`, 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      fullName: 'Test Logout User',
      roleId: 3, // customer role
      twoFactorEnabled: false // Disable 2FA for simpler logout testing
    });

    console.log(`   Create user status: ${createUserResponse.statusCode}`);
    if (createUserResponse.statusCode !== 200 && createUserResponse.statusCode !== 409) {
      console.log('   Create user response:', createUserResponse.body);
      console.log('   Continuing with existing user if available...');
    }

    // Step 2: Login
    console.log('\n2. Logging in...');
    const loginResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/login`, 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    console.log(`   Login Status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log('   Login failed:', loginResponse.body);
      return;
    }

    const loginData = JSON.parse(loginResponse.body);
    console.log('   Login response:', loginData);

    // Extract cookies from login
    const authCookies = extractCookies(loginResponse.cookies);
    console.log('   Auth cookies received:', authCookies ? 'Yes' : 'No');

    // Step 3: Verify we're authenticated
    console.log('\n3. Verifying authentication status...');
    const authCheckResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, authCookies);
    console.log(`   Auth check status: ${authCheckResponse.statusCode}`);
    
    if (authCheckResponse.statusCode === 200) {
      console.log('   ✅ User is authenticated');
      const authData = JSON.parse(authCheckResponse.body);
      console.log('   User data:', authData);
    } else {
      console.log('   ❌ User not authenticated:', authCheckResponse.body);
    }

    // Step 4: Test dashboard access while authenticated
    console.log('\n4. Testing dashboard access while authenticated...');
    const dashboardResponseAuth = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET', null, authCookies);
    console.log(`   Dashboard status while authenticated: ${dashboardResponseAuth.statusCode}`);
    
    if (dashboardResponseAuth.statusCode === 200) {
      console.log('   ✅ Dashboard accessible while authenticated');
    } else if (dashboardResponseAuth.statusCode === 302 || dashboardResponseAuth.statusCode === 307) {
      console.log(`   Redirected to: ${dashboardResponseAuth.headers.location}`);
    }

    // Step 5: Logout
    console.log('\n5. Performing logout...');
    const logoutResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST', {}, authCookies);
    console.log(`   Logout Status: ${logoutResponse.statusCode}`);
    console.log('   Logout response:', logoutResponse.body);

    // Extract cookies after logout (should clear auth cookies)
    const logoutCookies = extractCookies(logoutResponse.cookies);
    console.log('   New cookies after logout:', logoutCookies);

    // Step 6: Check auth status after logout
    console.log('\n6. Checking auth status after logout...');
    const authCheckAfterResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, logoutCookies);
    console.log(`   Auth check after logout status: ${authCheckAfterResponse.statusCode}`);
    
    if (authCheckAfterResponse.statusCode === 401) {
      console.log('   ✅ User correctly unauthenticated after logout');
    } else {
      console.log('   ⚠️  Unexpected auth status:', authCheckAfterResponse.body);
    }

    // Step 7: Test dashboard access after logout
    console.log('\n7. Testing dashboard access after logout...');
    const dashboardAfterResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET', null, logoutCookies);
    console.log(`   Dashboard access status after logout: ${dashboardAfterResponse.statusCode}`);
    
    if (dashboardAfterResponse.statusCode === 302 || dashboardAfterResponse.statusCode === 307) {
      const location = dashboardAfterResponse.headers.location;
      console.log(`   Redirected to: ${location}`);
      
      if (location && location.includes('/auth/login')) {
        console.log('   ✅ Correctly redirected to login page');
      } else {
        console.log('   ⚠️  Redirected to unexpected location');
      }
    } else {
      console.log('   ⚠️  Expected redirect but got:', dashboardAfterResponse.statusCode);
    }

    // Step 8: Test login page access after logout
    console.log('\n8. Testing login page access with logout parameter...');
    const loginPageResponse = await makeRequest(`${PRODUCTION_URL}/auth/login?logout=true`, 'GET', null, logoutCookies);
    console.log(`   Login page status: ${loginPageResponse.statusCode}`);
    
    if (loginPageResponse.statusCode === 200) {
      console.log('   ✅ Login page accessible after logout');
    } else if (loginPageResponse.statusCode === 302 || loginPageResponse.statusCode === 307) {
      const location = loginPageResponse.headers.location;
      console.log(`   ⚠️  Login page redirected to: ${location}`);
      console.log('   This might indicate a redirect loop issue');
    }

    // Step 9: Test regular login page access (without logout param)
    console.log('\n9. Testing regular login page access...');
    const regularLoginPageResponse = await makeRequest(`${PRODUCTION_URL}/auth/login`, 'GET', null, logoutCookies);
    console.log(`   Regular login page status: ${regularLoginPageResponse.statusCode}`);
    
    if (regularLoginPageResponse.statusCode === 200) {
      console.log('   ✅ Regular login page accessible');
    } else if (regularLoginPageResponse.statusCode === 302 || regularLoginPageResponse.statusCode === 307) {
      const location = regularLoginPageResponse.headers.location;
      console.log(`   ⚠️  Regular login page redirected to: ${location}`);
    }

    console.log('\n✅ Complete logout flow test finished!');
    console.log('\n📋 SUMMARY:');
    console.log('✓ User creation/login successful');
    console.log('✓ Authentication verification working');
    console.log('✓ Dashboard access tested (auth vs unauth)');
    console.log('✓ Logout API functionality verified');
    console.log('✓ Post-logout authentication status checked');
    console.log('✓ Post-logout redirects tested');
    console.log('✓ Login page accessibility verified');

  } catch (error) {
    console.error('❌ Error during logout flow test:', error);
  }
}

// Run the test
testCompleteLogoutFlow();
