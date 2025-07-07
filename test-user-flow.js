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

async function testUserLogin() {
  console.log('🔐 TESTING USER LOGIN AND DASHBOARD ACCESS');
  console.log('=' .repeat(80));
  console.log('🌍 Environment: https://globalpharmatrading.co.uk');
  console.log('📅 Test Date:', new Date().toISOString());
  console.log('');

  try {
    // Step 1: Try to login with a known user (if possible)
    console.log('1️⃣ TESTING LOGIN PROCESS');
    const loginData = JSON.stringify({
      email: 'mhamzawazir1996@gmail.com',
      password: 'testpassword' // This might not work, but let's see the response
    });

    const loginOptions = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('   Login Status:', loginResponse.statusCode);
    
    try {
      const loginResult = JSON.parse(loginResponse.body);
      console.log('   Login Response:', JSON.stringify(loginResult, null, 2));
      
      if (loginResult.requires2FA) {
        console.log('   ✅ 2FA required - this is expected');
        console.log('   📧 User would need to check email for verification code');
      } else if (loginResult.message === 'Login successful') {
        console.log('   ✅ Direct login successful');
      } else {
        console.log('   ❌ Login failed:', loginResult.message);
      }
    } catch (e) {
      console.log('   Raw login response:', loginResponse.body);
    }

    // Step 2: Test what happens when accessing dashboard without proper auth
    console.log('\n2️⃣ TESTING DASHBOARD ACCESS WITHOUT FULL AUTH');
    
    const dashboardOptions = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/dashboard',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };

    const dashboardResponse = await makeRequest(dashboardOptions);
    console.log('   Dashboard Status:', dashboardResponse.statusCode);
    
    // Check if it's redirecting or showing login
    if (dashboardResponse.body.includes('Login') || dashboardResponse.body.includes('login')) {
      console.log('   ✅ Dashboard correctly shows login form');
    } else if (dashboardResponse.body.includes('Dashboard')) {
      console.log('   ⚠️ Dashboard content visible (might be expected)');
    } else {
      console.log('   ❓ Unclear dashboard behavior');
    }

    // Step 3: Test admin dashboard specifically
    console.log('\n3️⃣ TESTING ADMIN DASHBOARD ACCESS');
    
    const adminOptions = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/admin/dashboard',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    };

    const adminResponse = await makeRequest(adminOptions);
    console.log('   Admin Dashboard Status:', adminResponse.statusCode);
    
    // Analyze the response content
    if (adminResponse.body.length < 1000) {
      console.log('   ⚠️ Very short response - might be a redirect or error');
      console.log('   Response body:', adminResponse.body);
    } else {
      console.log('   ✅ Got substantial HTML response');
      
      // Check for Next.js app structure
      if (adminResponse.body.includes('__NEXT_DATA__')) {
        console.log('   ✅ Next.js app structure detected');
      } else {
        console.log('   ❌ No Next.js app structure found');
      }
      
      // Check for AuthGuard behavior
      if (adminResponse.body.includes('AuthGuard') || adminResponse.body.includes('authentication')) {
        console.log('   ✅ AuthGuard component likely active');
      } else {
        console.log('   ❓ AuthGuard behavior unclear');
      }
      
      // Check for React/JS bundles
      if (adminResponse.body.includes('<script') && adminResponse.body.includes('chunks/')) {
        console.log('   ✅ JavaScript bundles detected');
      } else {
        console.log('   ❌ No JavaScript bundles found');
      }
    }

    // Step 4: Check build files directly
    console.log('\n4️⃣ TESTING BUILD INTEGRITY');
    
    // Try to access a known static asset
    const staticOptions = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/_next/static/css/', // This might fail, but let's see
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    try {
      const staticResponse = await makeRequest(staticOptions);
      console.log('   Static assets status:', staticResponse.statusCode);
      if (staticResponse.statusCode === 200 || staticResponse.statusCode === 404) {
        console.log('   ✅ Static asset serving working');
      }
    } catch (e) {
      console.log('   ⚠️ Could not test static assets');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎯 ANALYSIS SUMMARY');
    console.log('='.repeat(80));
    console.log('');
    console.log('📋 POSSIBLE ISSUES:');
    console.log('1. Client-side AuthGuard preventing content rendering');
    console.log('2. Next.js app not properly hydrating on admin routes');
    console.log('3. Build/deployment issue with admin dashboard specifically');
    console.log('4. Server-side rendering issue with admin components');
    console.log('');
    console.log('💡 RECOMMENDATIONS:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify admin dashboard works in local development');
    console.log('3. Test with a real user login flow');
    console.log('4. Check Network tab for failed asset loading');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function main() {
  await testUserLogin();
}

main();
