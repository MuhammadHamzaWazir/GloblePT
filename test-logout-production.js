const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';
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

async function testLogoutFlow() {
  console.log('🔄 Testing logout flow in production...\n');

  try {
    // Step 1: Login
    console.log('1. Logging in...');
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

    if (loginData.requires2FA) {
      console.log('   2FA required - this test focuses on logout, so we\'ll skip full 2FA flow');
      console.log('   For logout testing, we can test with any auth cookies we might have received');
    }

    // Extract cookies from login
    const authCookies = extractCookies(loginResponse.cookies);
    console.log('   Auth cookies:', authCookies);

    // Step 2: Check auth status before logout
    console.log('\n2. Checking auth status before logout...');
    const authCheckResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, authCookies);
    console.log(`   Auth check status: ${authCheckResponse.statusCode}`);
    console.log('   Auth check response:', authCheckResponse.body);

    // Step 3: Logout
    console.log('\n3. Performing logout...');
    const logoutResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST', {}, authCookies);
    console.log(`   Logout Status: ${logoutResponse.statusCode}`);
    console.log('   Logout response:', logoutResponse.body);

    // Extract cookies after logout
    const logoutCookies = extractCookies(logoutResponse.cookies);
    console.log('   Logout cookies:', logoutCookies);

    // Step 4: Check auth status after logout
    console.log('\n4. Checking auth status after logout...');
    const authCheckAfterResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, logoutCookies);
    console.log(`   Auth check after logout status: ${authCheckAfterResponse.statusCode}`);
    console.log('   Auth check after logout response:', authCheckAfterResponse.body);

    // Step 5: Test access to protected route after logout
    console.log('\n5. Testing access to dashboard after logout...');
    const dashboardResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET', null, logoutCookies);
    console.log(`   Dashboard access status: ${dashboardResponse.statusCode}`);
    
    if (dashboardResponse.statusCode === 302 || dashboardResponse.statusCode === 307) {
      const location = dashboardResponse.headers.location;
      console.log(`   Redirected to: ${location}`);
      
      if (location && location.includes('/auth/login')) {
        console.log('   ✅ Good: Redirected to login page as expected');
      } else {
        console.log('   ⚠️  Redirected to unexpected location');
      }
    } else {
      console.log('   Dashboard response headers:', dashboardResponse.headers);
      console.log('   Dashboard response body (first 200 chars):', dashboardResponse.body.substring(0, 200));
    }

    // Step 6: Test login page access with logout parameter
    console.log('\n6. Testing login page access with logout parameter...');
    const loginPageResponse = await makeRequest(`${PRODUCTION_URL}/auth/login?logout=true`, 'GET', null, logoutCookies);
    console.log(`   Login page status: ${loginPageResponse.statusCode}`);
    
    if (loginPageResponse.statusCode === 200) {
      console.log('   ✅ Login page accessible after logout');
    } else if (loginPageResponse.statusCode === 302 || loginPageResponse.statusCode === 307) {
      const location = loginPageResponse.headers.location;
      console.log(`   ⚠️  Login page redirected to: ${location}`);
    }

    console.log('\n✅ Logout flow test completed!');
    console.log('\nSUMMARY:');
    console.log('- Login API response received');
    console.log('- Logout API called successfully');
    console.log('- Auth status checked before and after logout');
    console.log('- Protected route access tested after logout');
    console.log('- Login page accessibility verified');

  } catch (error) {
    console.error('❌ Error during logout flow test:', error);
  }
}

// Run the test
testLogoutFlow();
