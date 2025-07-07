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
        'User-Agent': 'Middleware-Debug',
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
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
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

async function debugMiddleware() {
  console.log('🔍 DEBUGGING MIDDLEWARE BEHAVIOR');
  console.log('='.repeat(50));
  
  try {
    // Test different scenarios with detailed headers
    const testScenarios = [
      { url: '/dashboard', description: 'Dashboard (no auth)' },
      { url: '/admin', description: 'Admin (no auth)' },
      { url: '/staff-dashboard', description: 'Staff Dashboard (no auth)' },
      { url: '/auth/login', description: 'Login page' },
      { url: '/about', description: 'Public page (about)' },
      { url: '/', description: 'Homepage' }
    ];

    for (const scenario of testScenarios) {
      console.log(`\n🔍 Testing: ${scenario.description}`);
      console.log(`   URL: ${scenario.url}`);
      
      const response = await makeRequest(`${PRODUCTION_URL}${scenario.url}`);
      
      console.log(`   Status: ${response.statusCode}`);
      console.log(`   Headers:`);
      console.log(`     Cache-Control: ${response.headers['cache-control']}`);
      console.log(`     X-Middleware: ${response.headers['x-middleware']}`);
      console.log(`     X-Matched-Path: ${response.headers['x-matched-path']}`);
      console.log(`     Server: ${response.headers['server']}`);
      
      if (response.statusCode === 302 || response.statusCode === 307) {
        console.log(`   Redirected to: ${response.headers.location}`);
      } else if (response.statusCode === 200) {
        // Check if the content indicates proper handling
        const isHTML = response.body.includes('<html');
        console.log(`   Content type: ${isHTML ? 'HTML page' : 'Other'}`);
        
        if (isHTML && (scenario.url === '/dashboard' || scenario.url === '/admin' || scenario.url === '/staff-dashboard')) {
          console.log(`   ❌ Protected route serving HTML without authentication!`);
        }
      }
    }

    // Test with invalid auth token
    console.log(`\n🔍 Testing with invalid auth token:`);
    const invalidAuthResponse = await makeRequest(`${PRODUCTION_URL}/dashboard`, 'GET', null, 'pharmacy_auth=invalid-token');
    console.log(`   Status: ${invalidAuthResponse.statusCode}`);
    if (invalidAuthResponse.statusCode === 302 || invalidAuthResponse.statusCode === 307) {
      console.log(`   Redirected to: ${invalidAuthResponse.headers.location}`);
    }

    // Try to force cache bypass
    console.log(`\n🔍 Testing with cache bypass:`);
    const cacheBypassResponse = await makeRequest(
      `${PRODUCTION_URL}/dashboard?_t=${Date.now()}`, 
      'GET', 
      null, 
      ''
    );
    console.log(`   Status: ${cacheBypassResponse.statusCode}`);
    console.log(`   Cache-Control: ${cacheBypassResponse.headers['cache-control']}`);

    console.log('\n' + '='.repeat(50));
    console.log('🎯 MIDDLEWARE DEBUG SUMMARY');
    console.log('='.repeat(50));
    console.log('If protected routes return 200 without auth, the middleware is not working.');
    console.log('Possible causes:');
    console.log('1. Middleware not deployed properly');
    console.log('2. Vercel caching static pages');
    console.log('3. Middleware matcher not catching the routes');
    console.log('4. Error in middleware logic');

  } catch (error) {
    console.error('Error debugging middleware:', error);
  }
}

debugMiddleware();
