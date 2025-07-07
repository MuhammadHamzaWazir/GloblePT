const https = require('https');

async function testProductionEmailDirect() {
  console.log('🧪 Testing production email sending directly...');
  
  const postData = JSON.stringify({
    to: 'mhamzawazir1996@gmail.com',
    subject: 'Test Email from Production - Mailtrap',
    text: 'This is a test email sent directly from production using Mailtrap SMTP.',
    html: `
      <h2>Test Email from Production</h2>
      <p>This is a test email sent directly from production using Mailtrap SMTP.</p>
      <p><strong>Time:</strong> ${new Date().toISOString()}</p>
      <p><strong>SMTP Provider:</strong> Mailtrap</p>
    `
  });

  const options = {
    hostname: 'pharmacy-management-system-3rstpnfbb.vercel.app',
    port: 443,
    path: '/api/test-email',
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
        console.log('Status:', res.statusCode);
        try {
          const response = JSON.parse(data);
          console.log('Response:', JSON.stringify(response, null, 2));
          
          if (response.success) {
            console.log('✅ Email sent successfully!');
            console.log('📧 Check your email at mhamzawazir1996@gmail.com');
            console.log('📧 Also check your Mailtrap inbox at: https://mailtrap.io/inboxes');
          } else {
            console.log('❌ Email sending failed!');
            console.log('Error:', response.error || response.message);
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

// Also test the 2FA email sending specifically
async function testProduction2FAEmail() {
  console.log('\n🔐 Testing production 2FA email sending...');
  
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
        console.log('2FA Login Status:', res.statusCode);
        try {
          const response = JSON.parse(data);
          console.log('2FA Response:', JSON.stringify(response, null, 2));
          
          if (response.requiresVerification) {
            console.log('✅ 2FA triggered successfully!');
            if (response.emailSent) {
              console.log('✅ 2FA email sent successfully!');
              console.log('📧 Check your email at mhamzawazir1996@gmail.com for the verification code');
            } else {
              console.log('❌ 2FA email not sent! Check email configuration.');
            }
          } else {
            console.log('❌ 2FA not triggered!');
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
    await testProductionEmailDirect();
    await testProduction2FAEmail();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

main();
