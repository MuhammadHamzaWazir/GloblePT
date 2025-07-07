const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';
const TEST_EMAIL = 'mhamzawazir1996@gmail.com';

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
        'User-Agent': 'Production-Diagnostic',
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

async function diagnoseProductionIssues() {
  console.log('🔍 PRODUCTION DIAGNOSIS - Live Site Issues');
  console.log('='.repeat(60));
  console.log(`🌍 Testing: ${PRODUCTION_URL}`);
  console.log(`📧 Email: ${TEST_EMAIL}\n`);

  try {
    // Test 1: Check if we can trigger a 2FA flow
    console.log('1️⃣ TRIGGERING 2FA FLOW');
    const loginResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/login`, 'POST', {
      email: TEST_EMAIL,
      password: 'password123' // Standard test password
    });

    console.log(`   Login attempt status: ${loginResponse.statusCode}`);
    console.log(`   Login response: ${loginResponse.body}`);

    let authCookies = extractCookies(loginResponse.cookies);
    console.log(`   Cookies received: ${authCookies || 'None'}`);

    if (loginResponse.statusCode === 200) {
      const loginData = JSON.parse(loginResponse.body);
      
      if (loginData.requires2FA) {
        console.log('   ✅ 2FA required - this is expected');
        console.log(`   Verification required for: ${loginData.email}`);
        
        // Test sending verification code
        console.log('\n2️⃣ SENDING VERIFICATION CODE');
        const sendVerificationResponse = await makeRequest(
          `${PRODUCTION_URL}/api/auth/send-verification`, 
          'POST', 
          { email: TEST_EMAIL },
          authCookies
        );
        
        console.log(`   Send verification status: ${sendVerificationResponse.statusCode}`);
        console.log(`   Send verification response: ${sendVerificationResponse.body}`);
        
        if (sendVerificationResponse.statusCode === 200) {
          console.log('   ✅ Verification code sent successfully');
          console.log('   📧 Check your email for the 6-digit code');
          console.log('\n   ⏰ You now have a few minutes to:');
          console.log('      1. Check your email for the verification code');
          console.log('      2. Update the test script with the real code');
          console.log('      3. Re-run this script to test verification');
        } else {
          console.log('   ❌ Failed to send verification code');
        }
      } else if (loginData.message === 'Login successful') {
        console.log('   🔓 Login successful without 2FA');
        authCookies = extractCookies(loginResponse.cookies);
        
        // Test direct dashboard access
        console.log('\n2️⃣ TESTING DASHBOARD ACCESS');
        const dashboardResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET', null, authCookies);
        console.log(`   Dashboard status: ${dashboardResponse.statusCode}`);
        
        if (dashboardResponse.statusCode === 200) {
          console.log('   ✅ Dashboard accessible - user is properly authenticated');
        } else {
          console.log(`   ❌ Dashboard not accessible: ${dashboardResponse.statusCode}`);
          if (dashboardResponse.statusCode === 302 || dashboardResponse.statusCode === 307) {
            console.log(`   Redirected to: ${dashboardResponse.headers.location}`);
          }
        }
      }
    } else if (loginResponse.statusCode === 401) {
      console.log('   ❌ Login failed - user may not exist or password incorrect');
      console.log('   Let\'s check if the user exists...');
      
      // Check if we can trigger password reset to see if user exists
      console.log('\n2️⃣ CHECKING USER EXISTENCE');
      // We won't implement password reset test to avoid sending unwanted emails
      console.log('   User existence check skipped to avoid unwanted emails');
    }

    // Test 3: Check current authentication state
    console.log('\n3️⃣ CHECKING AUTHENTICATION STATE');
    const authMeResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, authCookies);
    console.log(`   Auth check status: ${authMeResponse.statusCode}`);
    console.log(`   Auth response: ${authMeResponse.body}`);

    // Test 4: Test the problematic flows
    console.log('\n4️⃣ TESTING PROBLEMATIC FLOWS');
    
    // Test login page access (should always work)
    const loginPageResponse = await makeRequest(`${PRODUCTION_URL}/auth/login`, 'GET');
    console.log(`   Login page status: ${loginPageResponse.statusCode}`);
    
    if (loginPageResponse.statusCode !== 200) {
      console.log('   ❌ CRITICAL: Login page not accessible!');
      if (loginPageResponse.statusCode === 302 || loginPageResponse.statusCode === 307) {
        console.log(`   Redirects to: ${loginPageResponse.headers.location}`);
        console.log('   🚨 REDIRECT LOOP CONFIRMED!');
      }
    } else {
      console.log('   ✅ Login page accessible');
    }

    // Test dashboard access without auth (should redirect)
    const dashboardNoAuthResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET');
    console.log(`   Dashboard (no auth) status: ${dashboardNoAuthResponse.statusCode}`);
    
    if (dashboardNoAuthResponse.statusCode === 200) {
      console.log('   ❌ SECURITY ISSUE: Dashboard accessible without authentication!');
    } else if (dashboardNoAuthResponse.statusCode === 302 || dashboardNoAuthResponse.statusCode === 307) {
      const location = dashboardNoAuthResponse.headers.location;
      console.log(`   Redirects to: ${location}`);
      if (location && location.includes('/auth/login')) {
        console.log('   ✅ Properly redirects to login');
      } else {
        console.log('   ⚠️ Redirects to unexpected location');
      }
    }

    // Test 5: Middleware behavior analysis
    console.log('\n5️⃣ MIDDLEWARE BEHAVIOR ANALYSIS');
    
    // Test with various cookie scenarios
    const testCookies = [
      '',
      'auth-token=invalid',
      'pharmacy_auth=invalid',
      'auth-token=; pharmacy_auth=',
    ];

    for (const [index, testCookie] of testCookies.entries()) {
      const description = testCookie === '' ? 'No cookies' : `Cookie: ${testCookie}`;
      const testResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET', null, testCookie);
      console.log(`   Test ${index + 1} (${description}): ${testResponse.statusCode}`);
      
      if (testResponse.statusCode === 302 || testResponse.statusCode === 307) {
        console.log(`     Redirects to: ${testResponse.headers.location}`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS SUMMARY');
    console.log('='.repeat(60));

    console.log('\n📋 KEY FINDINGS:');
    if (loginResponse.statusCode === 401) {
      console.log('❌ User authentication failing - user may not exist or password wrong');
    } else if (loginResponse.statusCode === 200) {
      console.log('✅ Login endpoint working');
    }

    if (loginPageResponse.statusCode === 200) {
      console.log('✅ Login page accessible - no redirect loops on login page');
    } else {
      console.log('❌ Login page has redirect issues');
    }

    console.log('\n🔧 NEXT STEPS:');
    if (loginResponse.statusCode === 401) {
      console.log('1. Verify user exists in production database');
      console.log('2. Check if password is correct');
      console.log('3. Ensure user account status is "verified"');
    }
    
    if (loginPageResponse.statusCode !== 200) {
      console.log('1. Check middleware configuration');
      console.log('2. Review redirect logic in middleware.ts');
      console.log('3. Check for infinite redirect conditions');
    }

    console.log('\n💡 To continue testing:');
    console.log('1. If 2FA code was sent, check your email');
    console.log('2. Update debug-2fa-verification.js with the real code');
    console.log('3. Run that script to test the verification flow');

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR during production diagnosis:', error);
  }
}

// Run the diagnosis
diagnoseProductionIssues();
