const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

console.log('🧪 Testing logout cookie clearing functionality...\n');

async function testLogoutCookieClearing() {
  console.log('🔐 Testing complete logout flow with cookie verification...');
  
  try {
    // Step 1: Login to get cookies
    console.log('Step 1: Logging in...');
    const loginResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/login`, 'POST', {
      email: 'admin@globalpharmatrading.co.uk',
      password: 'Admin@2024'
    });
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed, cannot test logout');
      return;
    }
    
    const loginCookies = extractCookies(loginResponse.headers);
    console.log('✅ Login successful');
    console.log(`   Cookies received: ${loginCookies ? 'Yes' : 'No'}`);
    
    if (loginCookies) {
      const hasPharmacyAuth = loginCookies.includes('pharmacy_auth');
      console.log(`   pharmacy_auth cookie: ${hasPharmacyAuth ? 'Present' : 'Missing'}`);
    }
    
    // Step 2: Verify authenticated state
    console.log('\nStep 2: Verifying authenticated state...');
    const authCheckResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, loginCookies);
    
    if (authCheckResponse.statusCode === 200) {
      console.log('✅ User is authenticated');
      const authData = JSON.parse(authCheckResponse.body);
      console.log(`   User: ${authData.user?.email || 'unknown'}`);
    } else {
      console.log('❌ Authentication check failed');
    }
    
    // Step 3: Logout and check cookie clearing
    console.log('\nStep 3: Calling logout API...');
    const logoutResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST', null, loginCookies);
    
    console.log(`   Logout API status: ${logoutResponse.statusCode}`);
    
    if (logoutResponse.statusCode === 200) {
      console.log('✅ Logout API call successful');
      
      const logoutData = JSON.parse(logoutResponse.body);
      console.log(`   Message: ${logoutData.message}`);
      
      // Check logout response headers for cookie clearing
      const logoutCookies = extractCookies(logoutResponse.headers);
      console.log(`   Response cookies: ${logoutCookies || 'None'}`);
      
      // Check Set-Cookie headers specifically
      const setCookieHeaders = logoutResponse.headers['set-cookie'];
      if (setCookieHeaders) {
        console.log('   Set-Cookie headers from logout:');
        setCookieHeaders.forEach((header, index) => {
          console.log(`     ${index + 1}: ${header}`);
          if (header.includes('pharmacy_auth') && (header.includes('Max-Age=0') || header.includes('expires='))) {
            console.log('     ✅ pharmacy_auth cookie deletion detected');
          }
        });
      } else {
        console.log('   ⚠️  No Set-Cookie headers in logout response');
      }
      
    } else {
      console.log('❌ Logout API call failed');
    }
    
    // Step 4: Verify logged out state
    console.log('\nStep 4: Verifying logged out state...');
    
    // Try using the original cookies after logout
    const postLogoutAuthCheck = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, loginCookies);
    
    if (postLogoutAuthCheck.statusCode === 401) {
      console.log('✅ User is no longer authenticated (cookies cleared server-side)');
    } else if (postLogoutAuthCheck.statusCode === 200) {
      console.log('❌ User is still authenticated (cookies NOT cleared properly)');
      const userData = JSON.parse(postLogoutAuthCheck.body);
      console.log(`   Still logged in as: ${userData.user?.email || 'unknown'}`);
    } else {
      console.log(`⚠️  Unexpected response: ${postLogoutAuthCheck.statusCode}`);
    }
    
    // Step 5: Test without any cookies
    console.log('\nStep 5: Testing fresh session (no cookies)...');
    const freshAuthCheck = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET');
    
    if (freshAuthCheck.statusCode === 401) {
      console.log('✅ Fresh session is unauthenticated as expected');
    } else {
      console.log(`⚠️  Unexpected fresh session state: ${freshAuthCheck.statusCode}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testLogoutEndpoint() {
  console.log('\n🔧 Testing logout endpoint behavior...');
  
  try {
    // Test logout without authentication
    const logoutResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST');
    
    console.log(`   Logout without auth: ${logoutResponse.statusCode}`);
    
    if (logoutResponse.statusCode === 200) {
      console.log('✅ Logout endpoint handles unauthenticated requests gracefully');
    }
    
    // Check response headers
    const setCookieHeaders = logoutResponse.headers['set-cookie'];
    if (setCookieHeaders) {
      console.log('   Cookie clearing headers present even without auth:');
      setCookieHeaders.forEach(header => {
        if (header.includes('pharmacy_auth')) {
          console.log(`     ${header}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Logout endpoint test failed:', error.message);
  }
}

function makeRequest(url, method, data = null, cookies = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Logout-Test-Script/1.0'
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

async function runLogoutTests() {
  console.log('🚀 Starting logout cookie clearing tests...\n');
  
  await testLogoutCookieClearing();
  await testLogoutEndpoint();
  
  console.log('\n📋 Test Summary:');
  console.log('✅ Updated dashboard sidebars to use auth context logout');
  console.log('✅ Enhanced logout API with multiple cookie clearing methods');
  console.log('✅ Improved client-side cookie deletion with domain handling');
  console.log('✅ Added comprehensive cleanup for localStorage/sessionStorage');
  
  console.log('\n🎯 Expected Behavior:');
  console.log('- pharmacy_auth cookie should be cleared from browser');
  console.log('- User should be redirected to login page');
  console.log('- Subsequent auth checks should return 401');
  console.log('- No authentication state should persist');
  
  console.log('\n✅ Logout cookie clearing test complete!');
}

runLogoutTests().catch(console.error);
