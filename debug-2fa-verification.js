const https = require('https');

async function testVerifyCode() {
  console.log('🔐 Testing 2FA code verification...');
  console.log('⚠️  Make sure to replace the code below with actual 6-digit code from your email!');
  
  const postData = JSON.stringify({
    email: 'mhamzawazir1996@gmail.com',
    code: '123456' // Replace this with the actual 6-digit code from your email
  });

  const options = {
    hostname: 'globalpharmatrading.co.uk',
    port: 443,
    path: '/api/auth/verify-code',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Verify Status:', res.statusCode);
        console.log('Response Headers:', res.headers);
        console.log('Set-Cookie:', res.headers['set-cookie']);
        
        try {
          const response = JSON.parse(data);
          console.log('Verify Response:', JSON.stringify(response, null, 2));
          
          if (response.message === 'Login successful') {
            console.log('✅ 2FA verification successful!');
            console.log('User:', response.user);
            console.log('User Role:', response.user?.role);
            
            // Check if cookie was set
            if (res.headers['set-cookie']) {
              console.log('✅ Authentication cookie set');
            } else {
              console.log('❌ No authentication cookie found!');
            }
          } else {
            console.log('❌ 2FA verification failed!');
          }
          
          resolve(response);
        } catch (e) {
          console.log('Raw response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function testAuthStatus() {
  console.log('\n🔍 Testing authentication status...');
  
  const options = {
    hostname: 'globalpharmatrading.co.uk',
    port: 443,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Auth Status:', res.statusCode);
        
        try {
          const response = JSON.parse(data);
          console.log('Auth Response:', JSON.stringify(response, null, 2));
          
          if (response.user) {
            console.log('✅ User is authenticated');
            console.log('User role:', response.user.role);
          } else {
            console.log('❌ User is not authenticated');
          }
          
          resolve(response);
        } catch (e) {
          console.log('Raw response:', data);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      reject(e);
    });

    req.end();
  });
}

async function main() {
  console.log('⚠️  Before running this test:');
  console.log('1. Log in to the website with 2FA');
  console.log('2. Get the 6-digit verification code from your email');
  console.log('3. Replace "123456" in this script with the actual code');
  console.log('4. Run this script immediately after getting the code\n');
  
  try {
    await testVerifyCode();
    await testAuthStatus();
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 DEBUGGING TIPS');
    console.log('='.repeat(80));
    console.log('If the verification succeeds but you still get redirected to login:');
    console.log('1. Check if the authentication cookie is being set');
    console.log('2. Check browser developer tools → Application → Cookies');
    console.log('3. Look for "pharmacy_auth" cookie');
    console.log('4. Check if the cookie has the correct domain and security settings');
    console.log('5. Try accessing /dashboard directly after successful verification');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
