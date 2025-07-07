const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';
const TEST_EMAIL = 'logout-test@example.com';
const TEST_PASSWORD = 'TestLogout123!';

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

function getCookieValue(cookieArray, name) {
  for (const cookie of cookieArray) {
    const [cookiePair] = cookie.split(';');
    const [key, value] = cookiePair.split('=');
    if (key.trim() === name) {
      return value;
    }
  }
  return null;
}

async function testFinalLogoutFlow() {
  console.log('🚀 FINAL LOGOUT FLOW TEST - Production Environment');
  console.log('='.repeat(60));
  console.log(`🎯 Testing with: ${TEST_EMAIL}`);
  console.log(`🌍 Environment: ${PRODUCTION_URL}\n`);

  try {
    // Step 1: Login
    console.log('1️⃣ LOGIN PHASE');
    console.log('   Attempting login...');
    const loginResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/login`, 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    console.log(`   Status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log(`   ❌ Login failed: ${loginResponse.body}`);
      return;
    }

    const loginData = JSON.parse(loginResponse.body);
    console.log('   ✅ Login successful');
    console.log(`   Response: ${JSON.stringify(loginData)}`);

    const authCookies = extractCookies(loginResponse.cookies);
    const authToken = getCookieValue(loginResponse.cookies, 'auth-token');
    console.log(`   Auth token received: ${authToken ? 'Yes' : 'No'}`);
    console.log(`   Full cookies: ${authCookies}`);

    // Step 2: Verify Authentication
    console.log('\n2️⃣ AUTHENTICATION VERIFICATION');
    const authCheckResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, authCookies);
    console.log(`   Status: ${authCheckResponse.statusCode}`);
    
    if (authCheckResponse.statusCode === 200) {
      const authData = JSON.parse(authCheckResponse.body);
      console.log('   ✅ User authenticated successfully');
      console.log(`   User data: ${JSON.stringify(authData)}`);
    } else {
      console.log(`   ⚠️ Auth verification failed: ${authCheckResponse.body}`);
    }

    // Step 3: Test Protected Route Access (While Authenticated)
    console.log('\n3️⃣ PROTECTED ROUTE ACCESS (AUTHENTICATED)');
    const dashboardAuthResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET', null, authCookies);
    console.log(`   Dashboard status: ${dashboardAuthResponse.statusCode}`);
    
    if (dashboardAuthResponse.statusCode === 200) {
      console.log('   ✅ Dashboard accessible while authenticated');
    } else if (dashboardAuthResponse.statusCode === 302 || dashboardAuthResponse.statusCode === 307) {
      console.log(`   Redirected to: ${dashboardAuthResponse.headers.location}`);
    } else {
      console.log(`   Unexpected response: ${dashboardAuthResponse.statusCode}`);
    }

    // Step 4: LOGOUT
    console.log('\n4️⃣ LOGOUT PHASE');
    console.log('   Performing logout...');
    const logoutResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST', {}, authCookies);
    console.log(`   Status: ${logoutResponse.statusCode}`);
    console.log(`   Response: ${logoutResponse.body}`);

    const logoutCookies = extractCookies(logoutResponse.cookies);
    console.log(`   Logout cookies: ${logoutCookies}`);

    // Check if auth-token was cleared
    const clearedAuthToken = getCookieValue(logoutResponse.cookies, 'auth-token');
    console.log(`   Auth token cleared: ${clearedAuthToken === '' ? 'Yes' : 'No'}`);

    // Step 5: Verify Unauthenticated State
    console.log('\n5️⃣ POST-LOGOUT AUTHENTICATION CHECK');
    const authCheckAfterResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, logoutCookies);
    console.log(`   Status: ${authCheckAfterResponse.statusCode}`);
    
    if (authCheckAfterResponse.statusCode === 401) {
      console.log('   ✅ User correctly unauthenticated after logout');
    } else {
      console.log(`   ⚠️ Unexpected auth status: ${authCheckAfterResponse.body}`);
    }

    // Step 6: Test Protected Route Access (After Logout)
    console.log('\n6️⃣ PROTECTED ROUTE ACCESS (AFTER LOGOUT)');
    const dashboardAfterResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET', null, logoutCookies);
    console.log(`   Dashboard status: ${dashboardAfterResponse.statusCode}`);
    
    if (dashboardAfterResponse.statusCode === 302 || dashboardAfterResponse.statusCode === 307) {
      const location = dashboardAfterResponse.headers.location;
      console.log(`   Redirected to: ${location}`);
      
      if (location && location.includes('/auth/login')) {
        console.log('   ✅ Correctly redirected to login page');
      } else {
        console.log('   ⚠️ Redirected to unexpected location');
      }
    } else if (dashboardAfterResponse.statusCode === 200) {
      console.log('   ❌ Dashboard still accessible after logout - SECURITY ISSUE!');
    } else {
      console.log(`   Unexpected status: ${dashboardAfterResponse.statusCode}`);
    }

    // Step 7: Test Login Page Access
    console.log('\n7️⃣ LOGIN PAGE ACCESS VERIFICATION');
    
    // Test login page with logout parameter
    const loginPageLogoutResponse = await makeRequest(`${PRODUCTION_URL}/auth/login?logout=true`, 'GET', null, logoutCookies);
    console.log(`   Login page (logout=true) status: ${loginPageLogoutResponse.statusCode}`);
    
    if (loginPageLogoutResponse.statusCode === 200) {
      console.log('   ✅ Login page accessible with logout parameter');
    } else if (loginPageLogoutResponse.statusCode === 302 || loginPageLogoutResponse.statusCode === 307) {
      const location = loginPageLogoutResponse.headers.location;
      console.log(`   ❌ Login page redirected to: ${location} - POSSIBLE REDIRECT LOOP!`);
    }

    // Test regular login page
    const loginPageResponse = await makeRequest(`${PRODUCTION_URL}/auth/login`, 'GET', null, logoutCookies);
    console.log(`   Regular login page status: ${loginPageResponse.statusCode}`);
    
    if (loginPageResponse.statusCode === 200) {
      console.log('   ✅ Regular login page accessible');
    } else if (loginPageResponse.statusCode === 302 || loginPageResponse.statusCode === 307) {
      console.log(`   ❌ Regular login page redirected - POSSIBLE REDIRECT LOOP!`);
    }

    // Step 8: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 FINAL TEST RESULTS SUMMARY');
    console.log('='.repeat(60));

    const results = {
      loginWorking: loginResponse.statusCode === 200,
      authVerificationWorking: authCheckResponse.statusCode === 200,
      dashboardAccessWhileAuth: dashboardAuthResponse.statusCode === 200,
      logoutAPIWorking: logoutResponse.statusCode === 200,
      unauthenticatedAfterLogout: authCheckAfterResponse.statusCode === 401,
      dashboardBlockedAfterLogout: dashboardAfterResponse.statusCode === 302 || dashboardAfterResponse.statusCode === 307,
      loginPageAccessible: loginPageResponse.statusCode === 200,
      loginPageLogoutParamAccessible: loginPageLogoutResponse.statusCode === 200,
      noRedirectLoops: loginPageResponse.statusCode === 200 && loginPageLogoutResponse.statusCode === 200
    };

    Object.entries(results).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      const description = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`${status} ${description}`);
    });

    if (results.noRedirectLoops) {
      console.log('\n🎉 SUCCESS: No redirect loops detected!');
      console.log('   Users should be able to logout and land on login page successfully.');
    } else {
      console.log('\n⚠️ WARNING: Potential redirect loop issues detected!');
      console.log('   Further investigation may be needed.');
    }

    console.log('\n🔧 RECOMMENDED ACTIONS:');
    if (!results.dashboardBlockedAfterLogout) {
      console.log('   - Review middleware authentication for dashboard route');
    }
    if (!results.noRedirectLoops) {
      console.log('   - Check middleware redirect logic for login page');
    }
    if (results.loginWorking && results.logoutAPIWorking && results.noRedirectLoops) {
      console.log('   - ✅ All core functionality working correctly!');
    }

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR during logout flow test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the comprehensive test
testFinalLogoutFlow();
