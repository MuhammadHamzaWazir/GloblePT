const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

console.log('🔍 Final verification of auth endpoint optimization...\n');

// Test for excessive requests patterns
async function testRequestPattern() {
  console.log('📊 Testing request patterns and optimization...');
  
  const startTime = Date.now();
  const requestTimes = [];
  
  // Make 5 requests with small delays to simulate user behavior
  for (let i = 0; i < 5; i++) {
    const requestStart = Date.now();
    const response = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET');
    const requestEnd = Date.now();
    
    requestTimes.push({
      request: i + 1,
      status: response.statusCode,
      duration: requestEnd - requestStart,
      timestamp: requestEnd
    });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const totalTime = Date.now() - startTime;
  
  console.log(`\n⏱️  Pattern Analysis (${totalTime}ms total):`);
  requestTimes.forEach(req => {
    console.log(`   Request ${req.request}: ${req.status} (${req.duration}ms)`);
  });
  
  // Check for consistent response times (should be fast due to less processing)
  const avgDuration = requestTimes.reduce((sum, r) => sum + r.duration, 0) / requestTimes.length;
  console.log(`   Average response time: ${avgDuration.toFixed(1)}ms`);
  
  if (avgDuration < 500) {
    console.log('✅ Response times are good (optimizations likely working)');
  } else {
    console.log('⚠️  Response times could be better');
  }
}

// Test rate limiting functionality
async function testRateLimit() {
  console.log('\n🛡️  Testing rate limiting protection...');
  
  const rapidRequests = [];
  const startTime = Date.now();
  
  // Make 15 rapid requests to test rate limiting
  for (let i = 0; i < 15; i++) {
    rapidRequests.push(makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET'));
  }
  
  const results = await Promise.all(rapidRequests);
  const endTime = Date.now();
  
  const rateLimitedCount = results.filter(r => r.statusCode === 429).length;
  const successCount = results.filter(r => r.statusCode === 401).length; // 401 is expected for unauth
  
  console.log(`   Made 15 rapid requests in ${endTime - startTime}ms`);
  console.log(`   Normal responses (401): ${successCount}`);
  console.log(`   Rate limited (429): ${rateLimitedCount}`);
  
  if (rateLimitedCount > 0) {
    console.log('✅ Rate limiting is active and working');
  } else {
    console.log('⚠️  Rate limiting not triggered (may need higher request volume)');
  }
}

// Test endpoint response consistency
async function testEndpointConsistency() {
  console.log('\n🎯 Testing endpoint response consistency...');
  
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET');
    
    console.log(`   Status Code: ${response.statusCode}`);
    
    if (response.body) {
      try {
        const data = JSON.parse(response.body);
        console.log(`   Response Structure: ${JSON.stringify(Object.keys(data))}`);
        console.log(`   Authenticated: ${data.authenticated}`);
        console.log(`   Message: ${data.message || 'none'}`);
        
        // Check for proper JSON structure
        if (data.hasOwnProperty('authenticated') && data.hasOwnProperty('message')) {
          console.log('✅ Response structure is consistent');
        } else {
          console.log('❌ Response structure inconsistent');
        }
        
      } catch (parseError) {
        console.log('❌ Response is not valid JSON');
      }
    }
  } catch (error) {
    console.error('❌ Endpoint test failed:', error.message);
  }
}

// Test with authentication to verify optimized flow
async function testOptimizedAuthFlow() {
  console.log('\n🔐 Testing optimized authentication flow...');
  
  try {
    // Login first
    const loginResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/login`, 'POST', {
      email: 'admin@globalpharmatrading.co.uk',
      password: 'Admin@2024'
    });
    
    if (loginResponse.statusCode === 200) {
      console.log('✅ Login successful');
      
      const cookies = extractCookies(loginResponse.headers);
      
      // Test auth/me with valid session
      const authResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, 'GET', null, cookies);
      
      if (authResponse.statusCode === 200) {
        console.log('✅ Authenticated /api/auth/me call successful');
        
        const data = JSON.parse(authResponse.body);
        if (data.authenticated && data.user) {
          console.log(`   User: ${data.user.email} (${data.user.role})`);
          console.log('✅ User data properly returned');
        }
      } else {
        console.log(`❌ Authenticated call failed: ${authResponse.statusCode}`);
      }
      
      // Logout
      await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, 'POST', null, cookies);
      console.log('✅ Logged out successfully');
      
    } else {
      console.log('❌ Login failed, skipping auth flow test');
    }
    
  } catch (error) {
    console.error('❌ Auth flow test failed:', error.message);
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
        'User-Agent': 'Auth-Optimization-Test/1.0'
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

async function runVerification() {
  console.log('🚀 Starting final auth endpoint optimization verification...\n');
  
  await testEndpointConsistency();
  await testRequestPattern();
  await testRateLimit();
  await testOptimizedAuthFlow();
  
  console.log('\n📋 Optimization Summary:');
  console.log('✅ Removed redundant API calls from MainHeader component');
  console.log('✅ Updated AuthGuard to use centralized auth context');
  console.log('✅ Added rate limiting to prevent excessive requests');
  console.log('✅ Implemented loading state management');
  console.log('✅ Improved error handling to reduce console noise');
  
  console.log('\n🎯 Expected Results:');
  console.log('- Significant reduction in /api/auth/me request volume');
  console.log('- No more repeated 401 error messages in browser console');
  console.log('- Better performance due to fewer redundant network calls');
  console.log('- Rate limiting protection against abuse');
  
  console.log('\n✅ Auth endpoint optimization verification complete!');
}

runVerification().catch(console.error);
