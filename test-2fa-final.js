const https = require('https');

async function testProduction2FAEmail() {
  console.log('🔐 Testing production 2FA email sending...');
  
  const postData = JSON.stringify({
    email: 'mhamzawazir1996@gmail.com',
    password: 'Qwerty123'
  });

  const options = {
    hostname: 'pharmacy-management-system-3rstpnfbb.vercel.app',
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
              console.log('');
              console.log('🎯 NEXT STEPS:');
              console.log('1. Check your email (mhamzawazir1996@gmail.com) for the 2FA verification code');
              console.log('2. Check your Mailtrap inbox for the email');
              console.log('3. Enter the code on the website login page');
              console.log('4. Complete the 2FA login flow');
            } else if (response.emailSent === false) {
              console.log('❌ 2FA email NOT sent! There might be an email delivery issue.');
              console.log('📧 Check SMTP configuration and logs');
            } else {
              console.log('❓ Email status unclear:', response.emailSent);
            }
          } else {
            console.log('❌ 2FA not triggered!');
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

// Also test by checking the verification endpoint
async function testVerificationEndpoint() {
  console.log('\n📧 Testing verification code sending endpoint...');
  
  const postData = JSON.stringify({
    email: 'mhamzawazir1996@gmail.com'
  });

  const options = {
    hostname: 'pharmacy-management-system-3rstpnfbb.vercel.app',
    port: 443,
    path: '/api/auth/send-verification',
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
        console.log('Verification Status:', res.statusCode);
        try {
          const response = JSON.parse(data);
          console.log('Verification Response:', JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log('✅ Verification email sent successfully!');
            console.log('📧 Check your email at mhamzawazir1996@gmail.com');
            console.log('🔗 Also check your Mailtrap inbox');
          } else {
            console.log('❌ Verification email failed!');
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
    await testProduction2FAEmail();
    await testVerificationEndpoint();
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 FINAL TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('1. Go to: https://pharmacy-management-system-3rstpnfbb.vercel.app/auth/login');
    console.log('2. Enter email: mhamzawazir1996@gmail.com');
    console.log('3. Enter password: Qwerty123');
    console.log('4. Click login and check if 2FA modal appears');
    console.log('5. Check your email and Mailtrap for the verification code');
    console.log('6. Enter the code to complete login');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
