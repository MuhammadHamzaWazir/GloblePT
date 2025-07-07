#!/usr/bin/env node

// Final test after environment variables are fixed
async function finalEmailTest() {
  console.log('🎯 FINAL EMAIL DELIVERY TEST');
  console.log('============================\n');

  try {
    // Test SMTP configuration first
    console.log('1️⃣ Checking SMTP configuration...');
    const smtpResponse = await fetch('https://globalpharmatrading.co.uk/api/admin/smtp');
    
    if (smtpResponse.ok) {
      const smtpData = await smtpResponse.json();
      console.log('SMTP Config:', JSON.stringify(smtpData.config, null, 2));
      
      // Check if key values are correct
      const issues = [];
      if (smtpData.config.host !== 'smtp.sendgrid.net') {
        issues.push(`❌ SMTP_HOST wrong: ${smtpData.config.host}`);
      }
      if (smtpData.config.user.trim() !== 'apikey') {
        issues.push(`❌ SMTP_USER wrong: "${smtpData.config.user}"`);
      }
      if (smtpData.config.port !== '587') {
        issues.push(`❌ SMTP_PORT wrong: ${smtpData.config.port}`);
      }
      
      if (issues.length > 0) {
        console.log('\n❌ SMTP Configuration Issues:');
        issues.forEach(issue => console.log(issue));
        console.log('\n💡 Please update environment variables in Vercel dashboard');
        return;
      }
      
      console.log('✅ SMTP configuration looks correct!\n');
    }

    // Test actual login and 2FA flow
    console.log('2️⃣ Testing 2FA login flow...');
    const loginResponse = await fetch('https://globalpharmatrading.co.uk/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'Test123!'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));

    if (loginData.requiresVerification) {
      if (loginData.emailSent) {
        console.log('\n🎉 SUCCESS! EMAIL DELIVERY IS WORKING!');
        console.log('✅ 2FA modal appears');
        console.log('✅ Email with verification code sent');
        console.log('📧 Check your inbox for the 2FA code');
        console.log('\n🔐 You can now complete the 2FA login process:');
        console.log('1. Check your email for the verification code');
        console.log('2. Enter the code in the 2FA modal');
        console.log('3. Complete login successfully');
      } else {
        console.log('\n❌ 2FA modal appears but email still not sent');
        console.log('💡 This means environment variables still need to be updated');
      }
    } else {
      console.log('\n❌ 2FA is not being triggered');
      console.log('💡 Check if 2FA is enabled for this user');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

finalEmailTest();
