// Debug production login API to see why cookies aren't being set
const https = require('https');

console.log('🔍 Debugging production login API - cookie setting issue...\n');

async function debugProductionLogin() {
  console.log('🧪 Testing production login API response headers...');
  
  try {
    const loginResponse = await makeRequest('https://globalpharmatrading.co.uk/api/auth/login', 'POST', {
      email: 'mhamzawazir1996@gmail.com',
      password: 'Test123!'
    });
    
    console.log(`📊 Login Response Analysis:`);
    console.log(`   Status: ${loginResponse.statusCode}`);
    console.log(`   Body: ${loginResponse.body}`);
    
    console.log(`\n📋 Response Headers:`);
    const headers = loginResponse.headers;
    Object.keys(headers).forEach(key => {
      console.log(`   ${key}: ${headers[key]}`);
    });
    
    console.log(`\n🍪 Cookie Analysis:`);
    const setCookieHeaders = headers['set-cookie'];
    if (setCookieHeaders) {
      console.log(`   Set-Cookie headers found: ${setCookieHeaders.length}`);
      setCookieHeaders.forEach((cookie, index) => {
        console.log(`     ${index + 1}: ${cookie}`);
        if (cookie.includes('pharmacy_auth')) {
          console.log(`       ✅ Found pharmacy_auth cookie!`);
        }
      });
    } else {
      console.log(`   ❌ NO Set-Cookie headers found in login response`);
      console.log(`   🚨 This is the problem - login is not setting cookies!`);
    }
    
    // Test if the login endpoint is even working
    if (loginResponse.statusCode === 200) {
      try {
        const responseData = JSON.parse(loginResponse.body);
        console.log(`\n✅ Login API Response Data:`);
        console.log(`   Message: ${responseData.message}`);
        console.log(`   Success: ${responseData.success}`);
        console.log(`   User: ${responseData.user ? responseData.user.email : 'Not provided'}`);
      } catch (e) {
        console.log(`   ❌ Could not parse login response JSON`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing production login:', error.message);
  }
}

async function testLogoutEndpointDirectly() {
  console.log('\n🔧 Testing logout endpoint directly...');
  
  try {
    const logoutResponse = await makeRequest('https://globalpharmatrading.co.uk/api/auth/logout', 'POST');
    
    console.log(`📊 Logout Response Analysis:`);
    console.log(`   Status: ${logoutResponse.statusCode}`);
    console.log(`   Body: ${logoutResponse.body}`);
    
    const setCookieHeaders = logoutResponse.headers['set-cookie'];
    if (setCookieHeaders) {
      console.log(`\n🍪 Logout Set-Cookie Headers:`);
      setCookieHeaders.forEach((cookie, index) => {
        console.log(`     ${index + 1}: ${cookie}`);
      });
    } else {
      console.log(`   ❌ NO Set-Cookie headers in logout response`);
    }
    
  } catch (error) {
    console.error('❌ Error testing logout endpoint:', error.message);
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
        'User-Agent': 'Production-Debug-Test/1.0'
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

async function runDebug() {
  await debugProductionLogin();
  await testLogoutEndpointDirectly();
  
  console.log(`\n📋 Diagnosis:`);
  console.log(`If login is not setting cookies, then:`);
  console.log(`1. The latest fixes may not be deployed to production`);
  console.log(`2. There may be a server configuration issue`);
  console.log(`3. The production environment may have different settings`);
  console.log(`\n🚀 Solution: Deploy the latest fixes to production`);
}

runDebug().catch(console.error);
