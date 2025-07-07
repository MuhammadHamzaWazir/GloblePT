#!/usr/bin/env node

// Test 2FA email sending from local development server
async function testLocal2FAEmail() {
  console.log('🏠 TESTING 2FA EMAIL FROM LOCAL SERVER');
  console.log('======================================\n');

  try {
    console.log('1️⃣ Starting local development server...');
    console.log('Make sure to run: npm run dev');
    console.log('Server should be running on: http://localhost:3000\n');

    // Test local SMTP configuration
    console.log('2️⃣ Testing local SMTP configuration...');
    const smtpResponse = await fetch('http://localhost:3000/api/admin/smtp');
    
    if (smtpResponse.ok) {
      const smtpData = await smtpResponse.json();
      console.log('Local SMTP Config:', JSON.stringify(smtpData.config, null, 2));
    } else {
      console.log('❌ Could not reach local server');
      console.log('💡 Make sure to run: npm run dev');
      return;
    }

    // Test 2FA login flow locally
    console.log('\n3️⃣ Testing local 2FA login flow...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'Test123!'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Local Login Response:', JSON.stringify(loginData, null, 2));

    if (loginData.requiresVerification) {
      console.log('\n✅ 2FA is correctly triggered locally');
      console.log('📧 Email sent status:', loginData.emailSent);

      // Test send verification endpoint locally
      console.log('\n4️⃣ Testing local verification email...');
      const verifyResponse = await fetch('http://localhost:3000/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'mhamzawazir1996@gmail.com'
        })
      });

      const verifyData = await verifyResponse.json();
      console.log('Local Verification Response:', JSON.stringify(verifyData, null, 2));

      if (verifyData.emailSent) {
        console.log('\n🎉 SUCCESS! 2FA email sent from local server');
        console.log('📧 Check your inbox: mhamzawazir1996@gmail.com');
        console.log('🔐 You should receive the verification code');
      } else {
        console.log('\n❌ 2FA email not sent from local server');
        console.log('💡 Check your local .env file configuration');
      }
    } else {
      console.log('\n❌ 2FA not triggered locally');
      console.log('💡 Check if 2FA is enabled for this user in local database');
    }

    // Test basic email sending locally
    console.log('\n5️⃣ Testing basic email functionality...');
    const testEmailResponse = await fetch('http://localhost:3000/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-test',
        email: 'mhamzawazir1996@gmail.com',
        name: 'Muhammad Hamza (Local Test)'
      })
    });

    const testEmailData = await testEmailResponse.json();
    console.log('Local Test Email Response:', JSON.stringify(testEmailData, null, 2));

  } catch (error) {
    console.error('❌ Local test failed:', error.message);
    console.log('\n💡 TROUBLESHOOTING:');
    console.log('1. Make sure local server is running: npm run dev');
    console.log('2. Check local .env file has SMTP settings');
    console.log('3. Verify database connection locally');
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 LOCAL DEVELOPMENT SETUP:');
  console.log('============================');
  console.log('To test locally with real email sending:');
  console.log('1. Create .env.local file with SMTP settings');
  console.log('2. Use Ethereal Email for testing (no real emails)');
  console.log('3. Or use Mailtrap for real email testing');
  console.log('4. Run: npm run dev');
  console.log('5. Test: node test-local-2fa-email.js');
}

testLocal2FAEmail();
