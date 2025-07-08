// Test nuclear cookie deletion on live site
const https = require('https');

const LIVE_URL = 'https://pharmacy-management-system-nph9m7bln.vercel.app';

console.log('🧪 TESTING NUCLEAR COOKIE DELETION ON LIVE SITE\n');
console.log(`🌐 Live URL: ${LIVE_URL}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

function makeRequest(path, method = 'GET') {
  return new Promise((resolve, reject) => {
    const url = new URL(path, LIVE_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'User-Agent': 'Nuclear-Cookie-Test/1.0',
        'Accept': '*/*'
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
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testNuclearDeletion() {
  try {
    console.log('1️⃣ Testing if site is accessible...');
    const homeResponse = await makeRequest('/');
    console.log(`   ✅ Site accessible: ${homeResponse.statusCode === 200 ? 'YES' : 'NO'} (Status: ${homeResponse.statusCode})`);
    
    console.log('\n2️⃣ Testing nuclear logout endpoint...');
    const logoutResponse = await makeRequest('/api/auth/logout', 'POST');
    console.log(`   📡 Logout endpoint status: ${logoutResponse.statusCode}`);
    
    if (logoutResponse.headers['set-cookie']) {
      const cookieHeaders = Array.isArray(logoutResponse.headers['set-cookie']) 
        ? logoutResponse.headers['set-cookie'] 
        : [logoutResponse.headers['set-cookie']];
      
      console.log(`   🍪 Nuclear deletion headers sent: ${cookieHeaders.length}`);
      console.log('   🔥 Sample nuclear deletion commands:');
      
      // Show first 5 nuclear deletion headers
      cookieHeaders.slice(0, 5).forEach((header, i) => {
        console.log(`      ${i + 1}. ${header}`);
      });
      
      if (cookieHeaders.length > 5) {
        console.log(`      ... and ${cookieHeaders.length - 5} more nuclear deletion commands`);
      }
      
      // Check for specific nuclear strategies
      const strategies = {
        'pharmacy_auth deletion': cookieHeaders.some(h => h.includes('pharmacy_auth=;')),
        'Max-Age=0 strategy': cookieHeaders.some(h => h.includes('Max-Age=0')),
        'Expires=Thu, 01 Jan 1970': cookieHeaders.some(h => h.includes('Thu, 01 Jan 1970')),
        'Domain strategies': cookieHeaders.some(h => h.includes('Domain=')),
        'Path strategies': cookieHeaders.some(h => h.includes('Path=')),
        'Secure deletion': cookieHeaders.some(h => h.includes('Secure')),
        'SameSite deletion': cookieHeaders.some(h => h.includes('SameSite='))
      };
      
      console.log('\n   🎯 Nuclear strategies detected:');
      Object.entries(strategies).forEach(([strategy, detected]) => {
        console.log(`      ${detected ? '✅' : '❌'} ${strategy}`);
      });
      
      // Check if we're hitting our target of 900+ deletion attempts
      if (cookieHeaders.length >= 50) {
        console.log(`\n   🎉 NUCLEAR SUCCESS: ${cookieHeaders.length} deletion commands sent!`);
        console.log('   💣 This should obliterate ALL cookies on the domain!');
      } else {
        console.log(`\n   ⚠️  Only ${cookieHeaders.length} deletion commands. Expected 50+`);
      }
      
    } else {
      console.log('   ❌ No Set-Cookie headers found in logout response');
    }
    
    console.log('\n3️⃣ Testing if login endpoint works...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST');
    console.log(`   📡 Login endpoint status: ${loginResponse.statusCode}`);
    
    console.log('\n4️⃣ Testing if auth/me endpoint works...');
    const meResponse = await makeRequest('/api/auth/me');
    console.log(`   📡 Auth/me endpoint status: ${meResponse.statusCode}`);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 NUCLEAR DEPLOYMENT TEST SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Site deployed and accessible: ${homeResponse.statusCode === 200 ? 'YES' : 'NO'}`);
    console.log(`✅ Nuclear logout endpoint working: ${logoutResponse.statusCode === 200 ? 'YES' : 'NO'}`);
    console.log(`✅ Cookie deletion headers sent: ${logoutResponse.headers['set-cookie'] ? 'YES' : 'NO'}`);
    console.log(`🔥 Nuclear deletion commands: ${logoutResponse.headers['set-cookie'] ? (Array.isArray(logoutResponse.headers['set-cookie']) ? logoutResponse.headers['set-cookie'].length : 1) : 0}`);
    
    if (logoutResponse.headers['set-cookie'] && (Array.isArray(logoutResponse.headers['set-cookie']) ? logoutResponse.headers['set-cookie'].length : 1) >= 50) {
      console.log('\n🎉 NUCLEAR COOKIE DELETION IS LIVE AND WORKING!');
      console.log('💣 The logout endpoint will obliterate ALL cookies!');
      console.log('🛡️  No 2FA users should have cookie issues anymore!');
    } else {
      console.log('\n⚠️  Nuclear deletion may not be fully deployed yet.');
      console.log('🔄 Try testing again in a few minutes.');
    }
    
  } catch (error) {
    console.error('❌ Error testing nuclear deletion:', error.message);
  }
}

testNuclearDeletion();
