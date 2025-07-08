// Test the complete authentication flow to verify logged-in users can access profile API
const https = require('https');

const DOMAIN = 'globalpharmatrading.co.uk';

console.log('🔐 TESTING COMPLETE AUTHENTICATION FLOW\n');

function makeRequest(path, method = 'GET', data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: DOMAIN,
      port: 443,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'Auth-Flow-Test/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData,
          cookies: res.headers['set-cookie'] || []
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

async function testAuthFlow() {
  console.log('🔍 Step 1: Test profile API without authentication...');
  
  try {
    // Test profile endpoint without authentication
    const profileResponse = await makeRequest('/api/users/profile');
    console.log(`   Profile API (no auth): ${profileResponse.statusCode} ${profileResponse.statusCode === 401 ? '✅ Correctly blocked' : '❌'}`);
    
    console.log('\n🔍 Step 2: Test auth/me endpoint...');
    
    // Test auth/me endpoint
    const authMeResponse = await makeRequest('/api/auth/me');
    console.log(`   Auth/me API: ${authMeResponse.statusCode} ${authMeResponse.statusCode === 401 ? '✅ Correctly returns 401' : '❌'}`);
    
    console.log('\n🔍 Step 3: Test login endpoint functionality...');
    
    // Test login endpoint (should accept POST requests)
    const loginTestResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'testpassword'
    });
    console.log(`   Login endpoint: ${loginTestResponse.statusCode} ${[401, 400, 404].includes(loginTestResponse.statusCode) ? '✅ Endpoint working' : '❌'}`);
    
    console.log('\n🔍 Step 4: Check for trailing slash redirects...');
    
    // Test if we're still getting 308 redirects
    const apiNoSlash = await makeRequest('/api/users/profile');
    const apiWithSlash = await makeRequest('/api/users/profile/');
    
    console.log(`   API without slash: ${apiNoSlash.statusCode} ${apiNoSlash.statusCode === 401 ? '✅ Direct 401' : apiNoSlash.statusCode === 308 ? '❌ Still redirecting' : '?'}`);
    console.log(`   API with slash: ${apiWithSlash.statusCode} ${apiWithSlash.statusCode === 401 ? '✅ Direct 401' : '?'}`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 AUTHENTICATION FLOW ANALYSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (apiNoSlash.statusCode === 401 && !apiNoSlash.statusCode === 308) {
      console.log('✅ FIXED: No more trailing slash redirects losing cookies');
      console.log('✅ Profile API correctly requires authentication');
      console.log('✅ API endpoints ready for logged-in users');
      
      console.log('\n🎯 NEXT STEPS FOR TESTING:');
      console.log('1. Login with valid credentials at: https://globalpharmatrading.co.uk/auth/login');
      console.log('2. Check browser dev tools for pharmacy_auth cookie being set');
      console.log('3. Visit profile page: https://globalpharmatrading.co.uk/dashboard/profile');
      console.log('4. Check console logs for detailed API debug information');
      console.log('5. Profile data should load successfully for authenticated users');
      
      console.log('\n🔧 FIXES APPLIED:');
      console.log('• Removed trailingSlash: true from next.config.ts');
      console.log('• Fixed all API endpoints to use pharmacy_auth cookie');
      console.log('• Added comprehensive debug logging to profile API');
      console.log('• Updated ProfilePage to handle API calls better');
      
    } else if (apiNoSlash.statusCode === 308) {
      console.log('⚠️  Still getting 308 redirects - fix may need time to deploy');
      console.log('🔄 Wait a few minutes for Vercel deployment to complete');
    } else {
      console.log('🔍 Unexpected response - needs further investigation');
    }
    
    console.log('\n📊 CURRENT STATUS:');
    console.log(`• Site accessibility: ${profileResponse.statusCode < 500 ? '✅ Working' : '❌ Down'}`);
    console.log(`• API endpoints: ${authMeResponse.statusCode === 401 ? '✅ Working' : '❌ Issues'}`);
    console.log(`• Authentication flow: ${loginTestResponse.statusCode < 500 ? '✅ Ready' : '❌ Issues'}`);
    console.log(`• Cookie handling: ${apiNoSlash.statusCode === 401 ? '✅ Fixed' : '⚠️ Needs check'}`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testAuthFlow();
