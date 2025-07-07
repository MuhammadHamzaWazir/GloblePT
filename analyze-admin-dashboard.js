const https = require('https');

// Function to fetch and analyze the admin dashboard HTML
function fetchAdminDashboard() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'globalpharmatrading.co.uk',
      port: 443,
      path: '/admin/dashboard',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.end();
  });
}

async function analyzeAdminDashboard() {
  console.log('🔍 ANALYZING ADMIN DASHBOARD HTML');
  console.log('=' .repeat(60));
  
  try {
    const response = await fetchAdminDashboard();
    console.log('Status Code:', response.statusCode);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('');
    
    if (response.statusCode === 200) {
      const html = response.body;
      
      // Check for various logout-related elements
      const logoutChecks = [
        { name: 'Logout (exact)', pattern: /Logout/gi },
        { name: 'logout (lowercase)', pattern: /logout/gi },
        { name: 'sign out', pattern: /sign out/gi },
        { name: 'signout', pattern: /signout/gi },
        { name: 'FaSignOutAlt', pattern: /FaSignOutAlt/gi },
        { name: 'handleLogout', pattern: /handleLogout/gi },
        { name: 'onClick logout', pattern: /onClick.*logout/gi },
        { name: '/api/auth/logout', pattern: /\/api\/auth\/logout/gi },
        { name: 'Auth guard component', pattern: /AuthGuard/gi },
        { name: 'Sidebar component', pattern: /sidebar/gi }
      ];
      
      console.log('📊 LOGOUT FUNCTIONALITY ANALYSIS:');
      console.log('-'.repeat(60));
      
      logoutChecks.forEach(check => {
        const matches = html.match(check.pattern);
        const count = matches ? matches.length : 0;
        const status = count > 0 ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${count} occurrence(s)`);
        
        if (count > 0 && count <= 3) {
          console.log(`   Examples: ${matches.slice(0, 3).join(', ')}`);
        }
      });
      
      console.log('');
      console.log('📄 HTML STRUCTURE ANALYSIS:');
      console.log('-'.repeat(60));
      
      // Check if it's a Next.js app or static content
      if (html.includes('__NEXT_DATA__')) {
        console.log('✅ Next.js app detected (client-side rendering)');
        
        // Extract Next.js data
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
        if (nextDataMatch) {
          try {
            const nextData = JSON.parse(nextDataMatch[1]);
            console.log('   Page props available:', !!nextData.props);
            console.log('   Build ID:', nextData.buildId);
          } catch (e) {
            console.log('   Could not parse __NEXT_DATA__');
          }
        }
      } else {
        console.log('❌ Static HTML detected (not client-side app)');
      }
      
      // Check for React hydration
      if (html.includes('_app') || html.includes('react')) {
        console.log('✅ React components likely present');
      } else {
        console.log('❌ No React components detected');
      }
      
      // Check for script tags that might contain the sidebar component
      const scriptMatches = html.match(/<script[^>]*src="[^"]*"[^>]*>/gi);
      if (scriptMatches) {
        console.log(`✅ ${scriptMatches.length} script tags found (JS bundles)`);
      } else {
        console.log('❌ No script tags found');
      }
      
      console.log('');
      console.log('🎯 CONCLUSION:');
      console.log('-'.repeat(60));
      
      if (html.includes('Logout') || html.includes('logout')) {
        console.log('✅ Logout functionality appears to be present in HTML');
      } else if (html.includes('__NEXT_DATA__')) {
        console.log('⚠️ Logout functionality likely in client-side JS bundles');
        console.log('   (Not visible in server-rendered HTML)');
      } else {
        console.log('❌ Logout functionality not detected');
      }
      
    } else {
      console.log('❌ Could not fetch admin dashboard:', response.statusCode);
    }
    
  } catch (error) {
    console.error('❌ Error analyzing admin dashboard:', error.message);
  }
}

async function main() {
  console.log('📋 ADMIN DASHBOARD LOGOUT ANALYSIS');
  console.log('This script analyzes the actual HTML of the admin dashboard');
  console.log('to verify if logout functionality is present.\n');
  
  await analyzeAdminDashboard();
}

main();
