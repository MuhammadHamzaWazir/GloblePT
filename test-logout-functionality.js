const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

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

async function testLogoutFunctionalityOnly() {
  console.log('🎯 TESTING LOGOUT FUNCTIONALITY & REDIRECT BEHAVIOR');
  console.log('='.repeat(60));
  console.log('📝 Testing core logout mechanisms without full login flow');
  console.log(`🌍 Environment: ${PRODUCTION_URL}\n`);

  try {
    // Test 1: Logout API endpoint behavior
    console.log('1️⃣ LOGOUT API ENDPOINT TEST');
    console.log('   Testing logout endpoint without authentication...');
    const logoutNoAuthResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST', {});
    console.log(`   Status: ${logoutNoAuthResponse.statusCode}`);
    console.log(`   Response: ${logoutNoAuthResponse.body}`);
    
    if (logoutNoAuthResponse.statusCode === 200) {
      console.log('   ✅ Logout endpoint handles unauthenticated requests gracefully');
    } else {
      console.log('   ⚠️ Logout endpoint behavior with no auth needs review');
    }

    // Extract any cookies that might be set during logout
    const logoutCookies = extractCookies(logoutNoAuthResponse.cookies);
    console.log(`   Logout response cookies: ${logoutCookies || 'None'}`);

    // Test 2: Login page accessibility (primary redirect target)
    console.log('\n2️⃣ LOGIN PAGE ACCESSIBILITY TEST');
    
    // Test regular login page
    const loginPageResponse = await makeRequest(`${PRODUCTION_URL}/auth/login`, 'GET');
    console.log(`   Regular login page status: ${loginPageResponse.statusCode}`);
    
    if (loginPageResponse.statusCode === 200) {
      console.log('   ✅ Regular login page accessible');
    } else if (loginPageResponse.statusCode === 302 || loginPageResponse.statusCode === 307) {
      const location = loginPageResponse.headers.location;
      console.log(`   ❌ Regular login page redirects to: ${location}`);
      console.log('   ⚠️ This indicates a potential redirect loop!');
    }

    // Test login page with logout parameter
    const loginPageLogoutResponse = await makeRequest(`${PRODUCTION_URL}/auth/login?logout=true`, 'GET');
    console.log(`   Login page (logout=true) status: ${loginPageLogoutResponse.statusCode}`);
    
    if (loginPageLogoutResponse.statusCode === 200) {
      console.log('   ✅ Login page with logout parameter accessible');
    } else if (loginPageLogoutResponse.statusCode === 302 || loginPageLogoutResponse.statusCode === 307) {
      const location = loginPageLogoutResponse.headers.location;
      console.log(`   ❌ Login page with logout param redirects to: ${location}`);
      console.log('   ⚠️ This confirms redirect loop issues!');
    }

    // Test 3: Protected route redirects (should redirect to login)
    console.log('\n3️⃣ PROTECTED ROUTE REDIRECT TEST');
    
    const protectedRoutes = [
      '/dashboard',
      '/profile', 
      '/admin',
      '/staff-dashboard'
    ];

    for (const route of protectedRoutes) {
      const routeResponse = await makeRequest(`${PRODUCTION_URL}${route}`, 'GET');
      console.log(`   ${route} status: ${routeResponse.statusCode}`);
      
      if (routeResponse.statusCode === 302 || routeResponse.statusCode === 307) {
        const location = routeResponse.headers.location;
        console.log(`     Redirects to: ${location}`);
        
        if (location && location.includes('/auth/login')) {
          console.log('     ✅ Correctly redirects to login');
        } else {
          console.log('     ⚠️ Redirects to unexpected location');
        }
      } else if (routeResponse.statusCode === 200) {
        console.log('     ❌ Route accessible without authentication - SECURITY ISSUE!');
      } else if (routeResponse.statusCode === 404) {
        console.log('     ℹ️ Route not found (expected for some routes)');
      }
    }

    // Test 4: Auth API endpoints
    console.log('\n4️⃣ AUTH API ENDPOINTS TEST');
    
    const authMeResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET');
    console.log(`   /api/auth/me status: ${authMeResponse.statusCode}`);
    
    if (authMeResponse.statusCode === 401) {
      console.log('   ✅ Auth check correctly returns unauthorized');
    } else {
      console.log(`   ⚠️ Unexpected auth check response: ${authMeResponse.body}`);
    }

    // Test 5: Middleware behavior simulation
    console.log('\n5️⃣ MIDDLEWARE BEHAVIOR SIMULATION');
    
    // Test with fake auth token to see middleware behavior
    const fakeAuthCookie = 'auth-token=fake-invalid-token';
    const dashboardWithFakeAuthResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET', null, fakeAuthCookie);
    console.log(`   Dashboard with fake auth status: ${dashboardWithFakeAuthResponse.statusCode}`);
    
    if (dashboardWithFakeAuthResponse.statusCode === 302 || dashboardWithFakeAuthResponse.statusCode === 307) {
      const location = dashboardWithFakeAuthResponse.headers.location;
      console.log(`   Redirects to: ${location}`);
      
      if (location && location.includes('/auth/login')) {
        console.log('   ✅ Middleware correctly handles invalid auth tokens');
      }
    }

    // Summary and analysis
    console.log('\n' + '='.repeat(60));
    console.log('📊 LOGOUT FUNCTIONALITY ANALYSIS');
    console.log('='.repeat(60));

    const results = {
      logoutEndpointWorking: logoutNoAuthResponse.statusCode === 200,
      loginPageAccessible: loginPageResponse.statusCode === 200,
      loginPageLogoutParamAccessible: loginPageLogoutResponse.statusCode === 200,
      noRedirectLoopsDetected: loginPageResponse.statusCode === 200 && loginPageLogoutResponse.statusCode === 200,
      protectedRoutesRedirectProperly: true // Will be updated based on tests
    };

    Object.entries(results).forEach(([key, value]) => {
      if (key === 'protectedRoutesRedirectProperly') return; // Skip for now
      const status = value ? '✅' : '❌';
      const description = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      console.log(`${status} ${description}`);
    });

    console.log('\n🎯 CRITICAL FINDINGS:');
    
    if (results.noRedirectLoopsDetected) {
      console.log('✅ NO REDIRECT LOOPS: Users can successfully access login page after logout');
      console.log('   - Both /auth/login and /auth/login?logout=true are accessible');
      console.log('   - Logout flow should work correctly for users');
    } else {
      console.log('❌ REDIRECT LOOPS DETECTED: Users may get stuck in redirect loops');
      console.log('   - Login page is not accessible, causing infinite redirects');
      console.log('   - This is a critical issue that needs immediate attention');
    }

    if (results.logoutEndpointWorking) {
      console.log('✅ LOGOUT API: Working correctly');
    } else {
      console.log('❌ LOGOUT API: Issues detected');
    }

    console.log('\n🔧 RECOMMENDATIONS:');
    if (results.noRedirectLoopsDetected && results.logoutEndpointWorking) {
      console.log('✅ Core logout functionality appears to be working correctly!');
      console.log('   - Users should be able to logout and return to login page');
      console.log('   - No immediate action required for logout flow');
    } else {
      console.log('⚠️ Issues detected that may need attention:');
      if (!results.loginPageAccessible) {
        console.log('   - Review middleware logic for login page access');
      }
      if (!results.logoutEndpointWorking) {
        console.log('   - Check logout API implementation');
      }
    }

    console.log('\n✅ Logout functionality test completed!');

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR during logout functionality test:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the logout functionality test
testLogoutFunctionalityOnly();
