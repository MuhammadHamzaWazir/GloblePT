const https = require('https');

// Function to make HTTP requests with cookie handling
function makeRequest(options, postData = null, cookies = null) {
  return new Promise((resolve, reject) => {
    if (cookies) {
      options.headers = options.headers || {};
      options.headers['Cookie'] = cookies;
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          cookies: res.headers['set-cookie']
        });
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testLiveLogoutFlow() {
  console.log('🔍 TESTING LIVE LOGOUT FUNCTIONALITY ON PRODUCTION');
  console.log('=' .repeat(80));
  console.log('🌍 Environment: https://globalpharmatrading.co.uk');
  console.log('📅 Test Date:', new Date().toISOString());
  console.log('');

  try {
    // Test 1: Check logout API directly
    console.log('1️⃣ TESTING LOGOUT API DIRECTLY');
    const logoutOptions = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/api/auth/logout',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const logoutResponse = await makeRequest(logoutOptions);
    console.log('   Status:', logoutResponse.statusCode);
    console.log('   Response:', logoutResponse.body);
    console.log('   Set-Cookie headers:', logoutResponse.cookies);

    if (logoutResponse.statusCode === 200) {
      console.log('   ✅ Logout API responding correctly');
    } else {
      console.log('   ❌ Logout API not working');
      return;
    }

    // Test 2: Check if cookies are being cleared properly
    console.log('\n2️⃣ TESTING COOKIE CLEARING');
    if (logoutResponse.cookies) {
      const authCookie = logoutResponse.cookies.find(cookie => 
        cookie.includes('pharmacy_auth=') || cookie.includes('pharmacy_auth=;')
      );
      
      if (authCookie) {
        console.log('   Auth cookie header:', authCookie);
        if (authCookie.includes('pharmacy_auth=;') || authCookie.includes('Max-Age=0') || authCookie.includes('expires=')) {
          console.log('   ✅ Cookie is being cleared properly');
        } else {
          console.log('   ❌ Cookie clearing might not be working');
        }
      } else {
        console.log('   ⚠️ No pharmacy_auth cookie found in response');
      }
    } else {
      console.log('   ⚠️ No Set-Cookie headers found');
    }

    // Test 3: Test dashboard access after logout
    console.log('\n3️⃣ TESTING DASHBOARD ACCESS WITHOUT AUTH');
    const dashboardOptions = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/dashboard',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const dashboardResponse = await makeRequest(dashboardOptions);
    console.log('   Dashboard access status:', dashboardResponse.statusCode);
    
    if (dashboardResponse.statusCode === 200) {
      // Check if it's actually showing dashboard content or redirecting
      if (dashboardResponse.body.includes('Login') || dashboardResponse.body.includes('login')) {
        console.log('   ✅ Dashboard correctly redirects unauthenticated users');
      } else if (dashboardResponse.body.includes('Dashboard') || dashboardResponse.body.includes('dashboard')) {
        console.log('   ❌ Dashboard accessible without authentication - SECURITY ISSUE!');
      } else {
        console.log('   ⚠️ Unclear dashboard behavior');
      }
    } else if (dashboardResponse.statusCode === 302 || dashboardResponse.statusCode === 301) {
      console.log('   ✅ Dashboard correctly redirects (', dashboardResponse.statusCode, ')');
      console.log('   Redirect Location:', dashboardResponse.headers.location);
    } else {
      console.log('   ⚠️ Unexpected dashboard response:', dashboardResponse.statusCode);
    }

    // Test 4: Test admin dashboard specifically
    console.log('\n4️⃣ TESTING ADMIN DASHBOARD ACCESS');
    const adminOptions = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/admin/dashboard',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const adminResponse = await makeRequest(adminOptions);
    console.log('   Admin dashboard status:', adminResponse.statusCode);
    
    if (adminResponse.statusCode === 200) {
      if (adminResponse.body.includes('Logout') || adminResponse.body.includes('logout')) {
        console.log('   ✅ Admin dashboard has logout functionality');
      } else {
        console.log('   ❌ Admin dashboard missing logout functionality');
      }
    }

    // Test 5: Check auth/me endpoint
    console.log('\n5️⃣ TESTING AUTH STATUS ENDPOINT');
    const authOptions = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const authResponse = await makeRequest(authOptions);
    console.log('   Auth status code:', authResponse.statusCode);
    
    if (authResponse.statusCode === 401) {
      console.log('   ✅ Auth endpoint correctly returns unauthorized');
    } else {
      console.log('   ⚠️ Unexpected auth response:', authResponse.statusCode);
      console.log('   Response:', authResponse.body);
    }

    console.log('\n' + '='.repeat(80));
    console.log('🔧 POTENTIAL ISSUES TO INVESTIGATE:');
    console.log('='.repeat(80));
    console.log('1. Check browser cookies after logout');
    console.log('2. Verify JavaScript logout handlers are executing');
    console.log('3. Check network tab for failed logout requests');
    console.log('4. Verify cookie domain settings in production');
    console.log('5. Check if logout button click handlers are working');
    console.log('');
    console.log('🎯 MANUAL TESTING STEPS:');
    console.log('1. Open browser dev tools (F12)');
    console.log('2. Go to Network tab');
    console.log('3. Login to dashboard');
    console.log('4. Click logout button');
    console.log('5. Check for POST request to /api/auth/logout');
    console.log('6. Check response and cookies in Application tab');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function main() {
  await testLiveLogoutFlow();
}

main();
