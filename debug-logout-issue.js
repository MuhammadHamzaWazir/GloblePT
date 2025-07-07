const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';
const LOCAL_URL = 'http://localhost:3002';

console.log('🔍 Debugging logout cookie clearing issue...\n');

async function testLoginAndLogout(baseUrl) {
  console.log(`🧪 Testing complete login/logout flow on ${baseUrl}...`);
  
  try {
    // Step 1: Login with admin credentials
    console.log('Step 1: Attempting login...');
    const loginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', {
      email: 'admin@globalpharmatrading.co.uk',
      password: 'Admin@2024'
    });
    
    console.log(`   Login status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed - testing with different credentials...');
      
      // Try with different credentials
      const altLoginResponse = await makeRequest(`${baseUrl}/api/auth/login`, 'POST', {
        email: 'logout-test@example.com',
        password: 'Test123!'
      });
      
      console.log(`   Alt login status: ${altLoginResponse.statusCode}`);
      
      if (altLoginResponse.statusCode !== 200) {
        console.log('❌ Both login attempts failed, cannot test logout');
        return false;
      }
      
      // Use alt login response
      var cookies = extractCookies(altLoginResponse.headers);
    } else {
      var cookies = extractCookies(loginResponse.headers);
    }
    
    console.log(`   Cookies from login: ${cookies ? 'Present' : 'None'}`);
    
    if (!cookies) {
      console.log('❌ No cookies received from login');
      return false;
    }
    
    // Check if pharmacy_auth cookie is present
    const hasPharmacyAuth = cookies.includes('pharmacy_auth');
    console.log(`   pharmacy_auth cookie: ${hasPharmacyAuth ? 'YES' : 'NO'}`);
    
    // Step 2: Verify authentication with /api/auth/me
    console.log('\nStep 2: Verifying authentication...');
    const authResponse = await makeRequest(`${baseUrl}/api/auth/me`, 'GET', null, cookies);
    console.log(`   Auth check status: ${authResponse.statusCode}`);
    
    if (authResponse.statusCode === 200) {
      const authData = JSON.parse(authResponse.body);
      console.log(`   Authenticated as: ${authData.user?.email || 'unknown'}`);
      console.log('✅ User is properly authenticated');
    } else {
      console.log('❌ User is not authenticated after login');
      return false;
    }
    
    // Step 3: Call logout API
    console.log('\nStep 3: Calling logout API...');
    const logoutResponse = await makeRequest(`${baseUrl}/api/auth/logout`, 'POST', null, cookies);
    console.log(`   Logout status: ${logoutResponse.statusCode}`);
    
    if (logoutResponse.statusCode === 200) {
      console.log('✅ Logout API call successful');
      
      // Check logout response
      const logoutData = JSON.parse(logoutResponse.body);
      console.log(`   Logout message: ${logoutData.message}`);
      
      // Check for Set-Cookie headers
      const setCookieHeaders = logoutResponse.headers['set-cookie'];
      if (setCookieHeaders) {
        console.log('   Set-Cookie headers from logout:');
        setCookieHeaders.forEach((header, index) => {
          console.log(`     ${index + 1}: ${header}`);
        });
      } else {
        console.log('   ❌ NO Set-Cookie headers in logout response');
      }
    } else {
      console.log('❌ Logout API call failed');
      return false;
    }
    
    // Step 4: Test authentication after logout with SAME cookies
    console.log('\nStep 4: Testing auth after logout (using same cookies)...');
    const postLogoutAuth = await makeRequest(`${baseUrl}/api/auth/me`, 'GET', null, cookies);
    console.log(`   Post-logout auth status: ${postLogoutAuth.statusCode}`);
    
    if (postLogoutAuth.statusCode === 401) {
      console.log('✅ Cookies invalidated - user is logged out');
    } else if (postLogoutAuth.statusCode === 200) {
      console.log('❌ User is STILL authenticated after logout!');
      const stillAuthData = JSON.parse(postLogoutAuth.body);
      console.log(`   Still logged in as: ${stillAuthData.user?.email || 'unknown'}`);
      return false;
    }
    
    // Step 5: Test with no cookies
    console.log('\nStep 5: Testing fresh request (no cookies)...');
    const freshAuth = await makeRequest(`${baseUrl}/api/auth/me`, 'GET');
    console.log(`   Fresh request status: ${freshAuth.statusCode}`);
    
    if (freshAuth.statusCode === 401) {
      console.log('✅ Fresh requests properly unauthenticated');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error in login/logout test:', error.message);
    return false;
  }
}

async function debugLogoutAPI() {
  console.log('\n🔧 Debugging logout API specifically...');
  
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST');
    console.log(`   Status: ${response.statusCode}`);
    console.log(`   Body: ${response.body}`);
    
    const headers = response.headers;
    console.log('\n   Response Headers:');
    console.log(`     content-type: ${headers['content-type']}`);
    console.log(`     set-cookie: ${headers['set-cookie']}`);
    
    if (headers['set-cookie']) {
      console.log('\n   Set-Cookie Analysis:');
      headers['set-cookie'].forEach((cookie, index) => {
        console.log(`     ${index + 1}: ${cookie}`);
        if (cookie.includes('pharmacy_auth')) {
          if (cookie.includes('Max-Age=0') || cookie.includes('expires=')) {
            console.log('       ✅ Contains deletion directive');
          } else {
            console.log('       ❌ Missing deletion directive');
          }
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error testing logout API:', error.message);
  }
}

async function checkCookieIssues() {
  console.log('\n🍪 Analyzing potential cookie issues...');
  
  console.log('\nPotential issues to check:');
  console.log('1. HttpOnly cookies cannot be accessed/deleted by client-side JavaScript');
  console.log('2. Secure flag requires HTTPS (production vs local differences)');
  console.log('3. SameSite settings might affect cookie behavior');
  console.log('4. Domain/Path settings must match exactly for deletion');
  console.log('5. Browser may cache old cookie values');
  
  console.log('\nRecommended manual test:');
  console.log('1. Open browser DevTools → Application → Cookies');
  console.log('2. Clear all existing cookies for the site');
  console.log('3. Login and observe cookie creation');
  console.log('4. Click logout and observe if cookie gets deleted');
  console.log('5. If cookie remains, check its properties (HttpOnly, Secure, etc.)');
}

function makeRequest(url, method, data = null, cookies = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const moduleToUse = isHttps ? https : require('http');
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Logout-Debug-Test/1.0'
      }
    };

    if (cookies) {
      options.headers.Cookie = cookies;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = moduleToUse.request(options, (res) => {
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

async function runLogoutDebugging() {
  console.log('🚀 Starting comprehensive logout debugging...\n');
  
  // Test production
  const prodSuccess = await testLoginAndLogout(PRODUCTION_URL);
  
  // Debug logout API
  await debugLogoutAPI();
  
  // Check cookie issues
  await checkCookieIssues();
  
  console.log('\n📋 Debug Summary:');
  console.log(`Production logout test: ${prodSuccess ? 'PASSED' : 'FAILED'}`);
  
  if (!prodSuccess) {
    console.log('\n🔧 Next Steps to Fix:');
    console.log('1. Check that logout API is properly clearing httpOnly cookies');
    console.log('2. Verify cookie domain/path settings match exactly');
    console.log('3. Ensure secure flag is handled correctly');
    console.log('4. Test logout from actual dashboard UI, not just API');
    console.log('5. Check browser developer tools for cookie behavior');
  }
  
  console.log('\n✅ Logout debugging complete!');
}

runLogoutDebugging().catch(console.error);
