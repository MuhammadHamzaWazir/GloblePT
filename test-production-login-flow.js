const https = require('https');

async function testLoginFlow() {
  console.log('🔐 Testing complete login flow...');
  
  // Step 1: Initial login to trigger 2FA
  const loginData = JSON.stringify({
    email: 'mhamzawazir1996@gmail.com',
    password: 'your-password-here' // Replace with actual password
  });

  const loginOptions = {
    hostname: 'globalpharmatrading.co.uk',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  console.log('Step 1: Attempting initial login...');
  
  return new Promise((resolve, reject) => {
    const req = https.request(loginOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Login Status:', res.statusCode);
        
        try {
          const response = JSON.parse(data);
          console.log('Login Response:', JSON.stringify(response, null, 2));
          
          if (response.requiresVerification) {
            console.log('✅ 2FA required - this is expected');
            console.log('📧 Check your email for verification code');
            console.log('Then run: node debug-2fa-verification.js with the actual code');
          } else if (response.message === 'Login successful') {
            console.log('✅ Direct login successful (2FA disabled)');
            console.log('User:', response.user);
          } else {
            console.log('❌ Login failed:', response.message);
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

    req.write(loginData);
    req.end();
  });
}

async function testSendVerification() {
  console.log('\n📧 Testing verification code sending...');
  
  const verificationData = JSON.stringify({
    email: 'mhamzawazir1996@gmail.com'
  });

  const verificationOptions = {
    hostname: 'globalpharmatrading.co.uk',
    port: 443,
    path: '/api/auth/send-verification',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(verificationData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(verificationOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Verification Send Status:', res.statusCode);
        
        try {
          const response = JSON.parse(data);
          console.log('Verification Send Response:', JSON.stringify(response, null, 2));
          
          if (res.statusCode === 200) {
            console.log('✅ Verification code sent successfully');
            console.log('📧 Check your email inbox (and spam folder)');
          } else {
            console.log('❌ Failed to send verification code');
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

    req.write(verificationData);
    req.end();
  });
}

async function main() {
  console.log('🚀 Testing production login flow...');
  console.log('⚠️  Make sure to replace the password in this script before running!\n');
  
  try {
    await testLoginFlow();
    console.log('\n' + '='.repeat(60));
    await testSendVerification();
    
    console.log('\n' + '='.repeat(80));
    console.log('📋 NEXT STEPS');
    console.log('='.repeat(80));
    console.log('1. Check your email for the 6-digit verification code');
    console.log('2. Edit debug-2fa-verification.js and replace "123456" with the actual code');
    console.log('3. Run: node debug-2fa-verification.js');
    console.log('4. This will test the complete 2FA verification and redirect flow');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
