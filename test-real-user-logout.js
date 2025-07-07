// Test production logout with real user credentials
const https = require('https');

console.log('🧪 Testing production logout with real user credentials...\n');

async function testRealUserLogout() {
  console.log('🔧 Testing complete login/logout flow on production...');
  
  try {
    // Step 1: Login with real user credentials
    console.log('Step 1: Logging in with real user credentials...');
    const loginResponse = await makeRequest('https://globalpharmatrading.co.uk/api/auth/login', 'POST', {
      email: 'mhamzawazir1996@gmail.com',
      password: 'Test123!'
    });
    
    console.log(`   Login status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed');
      console.log(`   Response: ${loginResponse.body}`);
      return false;
    }
    
    const cookies = extractCookies(loginResponse.headers);
    console.log(`   Login cookies received: ${cookies ? 'YES' : 'NO'}`);
    
    if (!cookies) {
      console.log('❌ No cookies received from login');
      return false;
    }
    
    // Check for pharmacy_auth cookie specifically
    const hasPharmacyAuth = cookies.includes('pharmacy_auth');
    console.log(`   pharmacy_auth cookie present: ${hasPharmacyAuth ? 'YES' : 'NO'}`);
    
    if (!hasPharmacyAuth) {
      console.log('❌ pharmacy_auth cookie not found in login response');
      return false;
    }
    
    // Step 2: Verify authentication
    console.log('\nStep 2: Verifying authentication...');
    const authResponse = await makeRequest('https://globalpharmatrading.co.uk/api/auth/me', 'GET', null, cookies);
    console.log(`   Auth check status: ${authResponse.statusCode}`);
    
    if (authResponse.statusCode === 200) {
      const authData = JSON.parse(authResponse.body);
      console.log(`   Authenticated as: ${authData.user?.email || 'unknown'}`);
      console.log('✅ User is properly authenticated');
    } else {
      console.log('❌ User is not authenticated after login');
      console.log(`   Auth response: ${authResponse.body}`);
      return false;
    }
    
    // Step 3: Test logout
    console.log('\nStep 3: Testing logout...');
    const logoutResponse = await makeRequest('https://globalpharmatrading.co.uk/api/auth/logout', 'POST', null, cookies);
    console.log(`   Logout status: ${logoutResponse.statusCode}`);
    console.log(`   Logout response: ${logoutResponse.body}`);
    
    // Analyze logout headers
    const setCookieHeaders = logoutResponse.headers['set-cookie'];
    if (setCookieHeaders) {
      console.log('\n   📋 Logout Set-Cookie Headers Analysis:');
      setCookieHeaders.forEach((header, index) => {
        console.log(`     ${index + 1}: ${header}`);
        
        if (header.includes('pharmacy_auth')) {
          console.log('       🍪 This is the pharmacy_auth cookie deletion');
          
          // Check for proper deletion flags
          const hasExpired = header.includes('Expires=Thu, 01 Jan 1970') || header.includes('expires=Thu, 01 Jan 1970');
          const hasMaxAge0 = header.includes('Max-Age=0') || header.includes('max-age=0');
          const hasEmptyValue = header.includes('pharmacy_auth=;') || header.includes('pharmacy_auth="";');
          
          console.log(`       ✓ Empty value: ${hasEmptyValue ? 'YES' : 'NO'}`);
          console.log(`       ✓ Expired date: ${hasExpired ? 'YES' : 'NO'}`);
          console.log(`       ✓ Max-Age=0: ${hasMaxAge0 ? 'YES' : 'NO'}`);
          
          if (hasEmptyValue && (hasExpired || hasMaxAge0)) {
            console.log('       ✅ Cookie deletion header looks correct');
          } else {
            console.log('       ❌ Cookie deletion header may be incomplete');
          }
        }
      });
    } else {
      console.log('   ❌ NO Set-Cookie headers in logout response');
      return false;
    }
    
    // Step 4: Test authentication after logout (simulate browser behavior)
    console.log('\nStep 4: Testing auth after logout...');
    
    // Simulate browser cookie deletion by removing pharmacy_auth from cookies
    let updatedCookies = cookies;
    if (setCookieHeaders) {
      setCookieHeaders.forEach(cookieHeader => {
        if (cookieHeader.includes('pharmacy_auth=;') || cookieHeader.includes('pharmacy_auth="";')) {
          // Remove pharmacy_auth cookie from our test cookies
          updatedCookies = updatedCookies.replace(/pharmacy_auth=[^;]+;?\s?/g, '').trim();
          if (updatedCookies.endsWith(';')) {
            updatedCookies = updatedCookies.slice(0, -1);
          }
        }
      });
    }
    
    console.log(`   Original cookies: ${cookies.substring(0, 100)}...`);
    console.log(`   Updated cookies after logout: "${updatedCookies}"`);
    
    const postLogoutAuth = await makeRequest('https://globalpharmatrading.co.uk/api/auth/me', 'GET', null, updatedCookies || null);
    console.log(`   Post-logout auth status: ${postLogoutAuth.statusCode}`);
    
    if (postLogoutAuth.statusCode === 401) {
      console.log('✅ Logout successful - user is no longer authenticated');
      return true;
    } else if (postLogoutAuth.statusCode === 200) {
      console.log('❌ User is STILL authenticated after logout!');
      const stillAuthData = JSON.parse(postLogoutAuth.body);
      console.log(`   Still logged in as: ${stillAuthData.user?.email || 'unknown'}`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error in production logout test:', error.message);
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
        'User-Agent': 'Real-User-Logout-Test/1.0'
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

async function runRealUserTest() {
  console.log('🚀 Testing production logout with real user credentials...\n');
  
  const success = await testRealUserLogout();
  
  console.log(`\n📋 Real User Logout Test Result: ${success ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  if (!success) {
    console.log('\n🔧 Next Steps:');
    console.log('1. Check if current production deployment has latest logout fixes');
    console.log('2. Verify browser cache is not interfering');
    console.log('3. Test logout from actual dashboard UI');
    console.log('4. Check browser developer tools for cookie behavior');
  }
}

runRealUserTest().catch(console.error);
