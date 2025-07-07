const https = require('https');

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  const postData = JSON.stringify({
    email: 'mhamzawazir1996@gmail.com',
    password: 'Qwerty123',
    name: 'Muhammad Hamza Wazir',
    confirmPassword: 'Qwerty123'
  });

  const options = {
    hostname: 'globalpharmatrading.co.uk',
    port: 443,
    path: '/api/auth/register',
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
        console.log('Register Status:', res.statusCode);
        try {
          const response = JSON.parse(data);
          console.log('Register Response:', JSON.stringify(response, null, 2));
          
          if (response.success || response.user) {
            console.log('✅ User created successfully!');
          } else if (response.message && response.message.includes('already exists')) {
            console.log('ℹ️  User already exists - this is expected');
          } else {
            console.log('❌ User creation failed!');
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

async function enable2FA() {
  console.log('\n🔐 Enabling 2FA for user...');
  
  const postData = JSON.stringify({
    email: 'mhamzawazir1996@gmail.com',
    enable: true
  });

  const options = {
    hostname: 'globalpharmatrading.co.uk',
    port: 443,
    path: '/api/admin/enable-2fa',
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
        console.log('Enable 2FA Status:', res.statusCode);
        try {
          const response = JSON.parse(data);
          console.log('Enable 2FA Response:', JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log('✅ 2FA enabled successfully!');
          } else {
            console.log('❌ 2FA enabling failed!');
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

async function testProduction2FAEmail() {
  console.log('\n🔐 Testing production 2FA email sending...');
  
  const postData = JSON.stringify({
    email: 'mhamzawazir1996@gmail.com',
    password: 'Qwerty123'
  });

  const options = {
    hostname: 'globalpharmatrading.co.uk',
    port: 443,
    path: '/api/auth/login',
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
        console.log('Login Status:', res.statusCode);
        try {
          const response = JSON.parse(data);
          console.log('Login Response:', JSON.stringify(response, null, 2));
          
          if (response.requiresVerification) {
            console.log('✅ 2FA triggered successfully!');
            if (response.emailSent === true) {
              console.log('✅ 2FA email sent successfully!');
              console.log('📧 Check your email at mhamzawazir1996@gmail.com for the verification code');
              console.log('🔗 Also check your Mailtrap inbox at: https://mailtrap.io/inboxes');
            } else if (response.emailSent === false) {
              console.log('❌ 2FA email NOT sent! There might be an email delivery issue.');
            } else {
              console.log('❓ Email status unclear:', response.emailSent);
            }
          } else if (response.success) {
            console.log('✅ Login successful without 2FA (2FA might not be enabled)');
          } else {
            console.log('❌ Login failed!');
            if (response.message) {
              console.log('Message:', response.message);
            }
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

async function main() {
  try {
    await createTestUser();
    await enable2FA();
    await testProduction2FAEmail();
    
    console.log('\n' + '='.repeat(80));
    console.log('🎯 FINAL MANUAL TEST');
    console.log('='.repeat(80));
    console.log('Now test manually at: https://globalpharmatrading.co.uk/auth/login');
    console.log('Email: mhamzawazir1996@gmail.com');
    console.log('Password: Qwerty123');
    console.log('');
    console.log('Expected behavior:');
    console.log('1. Enter credentials and click login');
    console.log('2. 2FA modal should appear');
    console.log('3. Check your email for verification code');
    console.log('4. Check Mailtrap inbox for the email');
    console.log('5. Enter code and complete login');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
