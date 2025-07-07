const https = require('https');

async function testRouteProtection() {
  console.log('🛡️  Testing AuthGuard route protection...');
  
  const protectedRoutes = [
    '/dashboard',
    '/admin/dashboard',
    '/admin',
    '/staff-dashboard',
    '/supervisor-dashboard',
    '/assistant-portal'
  ];

  const results = [];

  for (const route of protectedRoutes) {
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
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Location: ${res.headers.location || 'None'}`);
            
            // Check if the response contains AuthGuard loading or redirect content
            const isProtected = data.includes('Redirecting to login') || 
                              data.includes('authenticate') ||
                              data.includes('loading') ||
                              res.statusCode === 302 ||
                              res.statusCode === 307;
            
            if (isProtected) {
              console.log('✅ Route appears to be protected');
            } else if (res.statusCode === 200 && !data.includes('authenticate')) {
              console.log('❌ Route may not be properly protected');
            } else {
              console.log('🔍 Route status unclear - manual verification needed');
            }
            
            resolve({ 
              route, 
              status: res.statusCode, 
              location: res.headers.location,
              isProtected,
              responseSize: data.length
            });
          });
        });

        req.on('error', (e) => {
          console.error('Request error:', e);
          reject(e);
        });

        req.end();
      });
      
      results.push(result);
    } catch (error) {
      console.error(`Error testing ${route}:`, error);
      results.push({ route, error: error.message });
    }
  }

  return results;
}

async function testPublicRoutes() {
  console.log('\n🌐 Testing public routes...');
  
  const publicRoutes = [
    '/',
    '/about',
    '/services',
    '/contact',
    '/auth/login'
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
      await new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
          console.log(`Status: ${res.statusCode}`);
          
          if (res.statusCode === 200) {
            console.log('✅ Public route accessible');
          } else {
            console.log('❌ Public route issue:', res.statusCode);
          }
          
          resolve({ status: res.statusCode });
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
  console.log('🚀 Testing AuthGuard implementation...\n');
  
  try {
    const protectionResults = await testRouteProtection();
    await testPublicRoutes();
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 PROTECTION SUMMARY');
    console.log('='.repeat(80));
    
    protectionResults.forEach(result => {
      if (result.error) {
        console.log(`❌ ${result.route}: ERROR - ${result.error}`);
      } else {
        const status = result.isProtected ? '✅ PROTECTED' : 
                      result.status === 200 ? '❌ VULNERABLE' : '🔍 UNCLEAR';
        console.log(`${status} ${result.route} (${result.status})`);
      }
    });
    
    console.log('='.repeat(80));
    console.log('📝 NOTES:');
    console.log('- AuthGuard provides client-side protection');
    console.log('- Routes may load briefly before redirect');
    console.log('- Check browser console for AuthGuard logs');
    console.log('- Manual testing recommended for full verification');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
