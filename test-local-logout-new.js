// Simple test to create a user and test login/logout locally
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const http = require('http');

const prisma = new PrismaClient();

console.log('🧪 Creating test user and testing logout locally...\n');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    
    // Get customer role
    const customerRole = await prisma.role.findFirst({
      where: { name: 'customer' }
    });
    
    if (!customerRole) {
      console.log('❌ Customer role not found');
      return false;
    }
    
    // Delete existing test user if any
    await prisma.user.deleteMany({
      where: { email: 'logout-test@example.com' }
    });
    
    // Create new test user
    const user = await prisma.user.create({
      data: {
        name: 'Logout Test User',
        email: 'logout-test@example.com',
        password: hashedPassword,
        roleId: customerRole.id,
        accountStatus: 'active',
        address: 'Test Address 123'
      }
    });
    
    console.log(`✅ Test user created: ${user.email}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    return false;
  }
}

async function testLocalLogout() {
  console.log('\n🔧 Testing logout on local server...');
  
  try {
    // Step 1: Login
    console.log('Step 1: Logging in...');
    const loginResponse = await makeRequest('http://localhost:3000/api/auth/login', 'POST', {
      email: 'logout-test@example.com',
      password: 'Test123!'
    });
    
    console.log(`   Login status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ Login failed');
      console.log(`   Response: ${loginResponse.body}`);
      return false;
    }
    
    const cookies = extractCookies(loginResponse.headers);
    console.log(`   Cookies: ${cookies}`);
    
    // Step 2: Verify auth
    console.log('\nStep 2: Verifying authentication...');
    const authResponse = await makeRequest('http://localhost:3000/api/auth/me', 'GET', null, cookies);
    console.log(`   Auth status: ${authResponse.statusCode}`);
    
    if (authResponse.statusCode !== 200) {
      console.log('❌ Not authenticated after login');
      return false;
    }
    
    // Step 3: Logout
    console.log('\nStep 3: Calling logout...');
    const logoutResponse = await makeRequest('http://localhost:3000/api/auth/logout', 'POST', null, cookies);
    console.log(`   Logout status: ${logoutResponse.statusCode}`);
    console.log(`   Logout body: ${logoutResponse.body}`);
    
    // Check logout headers
    const logoutHeaders = logoutResponse.headers['set-cookie'];
    if (logoutHeaders) {
      console.log('   Logout Set-Cookie headers:');
      logoutHeaders.forEach((header, index) => {
        console.log(`     ${index + 1}: ${header}`);
      });
    } else {
      console.log('   ❌ No Set-Cookie headers in logout response');
    }
    
    // Step 4: Test auth after logout (simulate browser behavior)
    console.log('\nStep 4: Testing auth after logout...');
    
    // Update cookies based on logout response headers
    let updatedCookies = cookies;
    const setCookieHeaders = logoutResponse.headers['set-cookie'];
    if (setCookieHeaders) {
      setCookieHeaders.forEach(cookieHeader => {
        if (cookieHeader.includes('pharmacy_auth=;')) {
          // Cookie is being deleted, remove it from our cookies
          updatedCookies = updatedCookies.replace(/pharmacy_auth=[^;]+;?\s?/g, '').trim();
          if (updatedCookies.endsWith(';')) {
            updatedCookies = updatedCookies.slice(0, -1);
          }
        }
      });
    }
    
    console.log(`   Updated cookies after logout: "${updatedCookies}"`);
    
    const postLogoutResponse = await makeRequest('http://localhost:3000/api/auth/me', 'GET', null, updatedCookies || null);
    console.log(`   Post-logout auth status: ${postLogoutResponse.statusCode}`);
    
    if (postLogoutResponse.statusCode === 401) {
      console.log('✅ Logout successful - user is no longer authenticated');
      return true;
    } else {
      console.log('❌ Logout failed - user is still authenticated');
      console.log(`   Response: ${postLogoutResponse.body}`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error in local logout test:', error.message);
    return false;
  }
}

function makeRequest(url, method, data = null, cookies = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Local-Logout-Test/1.0'
      }
    };

    if (cookies) {
      options.headers.Cookie = cookies;
    }

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
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

async function runTest() {
  const userCreated = await createTestUser();
  
  if (userCreated) {
    const logoutWorked = await testLocalLogout();
    console.log(`\n📋 Result: Logout ${logoutWorked ? 'WORKS' : 'FAILED'}`);
  }
  
  await prisma.$disconnect();
}

runTest().catch(console.error);
