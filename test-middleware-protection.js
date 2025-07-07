const https = require('https');

async function testMiddlewareProtection() {
  console.log('🛡️  Testing middleware protection...');
  
  const testRoutes = [
    '/dashboard',
    '/admin/dashboard',
    '/staff-dashboard',
    '/supervisor-dashboard',
    '/assistant-portal'
  ];

  for (const route of testRoutes) {
    console.log(`\nTesting route: ${route}`);
    
    const options = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: route,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    try {
      const result = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          console.log(`Status: ${res.statusCode}`);
          console.log(`Location: ${res.headers.location || 'None'}`);
          
          if (res.statusCode === 302 || res.statusCode === 307) {
            if (res.headers.location && res.headers.location.includes('/auth/login')) {
              console.log('✅ Properly redirected to login');
            } else {
              console.log('❌ Redirected but not to login:', res.headers.location);
            }
          } else if (res.statusCode === 200) {
            console.log('❌ Route is accessible without authentication!');
          } else {
            console.log(`ℹ️  Unexpected status: ${res.statusCode}`);
          }
          
          resolve({ status: res.statusCode, location: res.headers.location });
        });

        req.on('error', (e) => {
          console.error('Request error:', e);
          reject(e);
        });

        req.end();
      });
    } catch (error) {
      console.error(`Error testing ${route}:`, error);
    }
  }
}

async function testPublicRoutes() {
  console.log('\n🌐 Testing public routes...');
  
  const publicRoutes = [
    '/',
    '/about',
    '/services',
    '/contact',
    '/auth/login',
    '/auth/register'
  ];

  for (const route of publicRoutes) {
    console.log(`\nTesting public route: ${route}`);
    
    const options = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: route,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    try {
      const result = await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          console.log(`Status: ${res.statusCode}`);
          
          if (res.statusCode === 200) {
            console.log('✅ Public route accessible');
          } else if (res.statusCode === 302 || res.statusCode === 307) {
            console.log('❌ Public route redirecting:', res.headers.location);
          } else {
            console.log(`ℹ️  Unexpected status: ${res.statusCode}`);
          }
          
          resolve({ status: res.statusCode, location: res.headers.location });
        });

        req.on('error', (e) => {
          console.error('Request error:', e);
          reject(e);
        });

        req.end();
      });
    } catch (error) {
      console.error(`Error testing ${route}:`, error);
    }
  }
}

async function main() {
  console.log('🚀 Testing middleware protection and route accessibility...\n');
  
  try {
    await testMiddlewareProtection();
    await testPublicRoutes();
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 SUMMARY');
    console.log('='.repeat(80));
    console.log('Protected routes should redirect to /auth/login (status 302/307)');
    console.log('Public routes should be accessible (status 200)');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
