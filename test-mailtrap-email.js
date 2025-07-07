#!/usr/bin/env node

// Test Mailtrap email configuration
async function testMailtrapEmail() {
  console.log('📧 TESTING MAILTRAP EMAIL CONFIGURATION');
  console.log('=======================================\n');

  try {
    console.log('1️⃣ Testing SMTP configuration...');
    
    const smtpResponse = await fetch('https://globalpharmatrading.co.uk/api/admin/smtp');
    if (smtpResponse.ok) {
      const smtpData = await smtpResponse.json();
      console.log('SMTP Config:', JSON.stringify(smtpData.config, null, 2));
      
      // Check if Mailtrap configuration is correct
      const isMailtrap = smtpData.config.host === 'live.smtp.mailtrap.io';
      const correctPort = smtpData.config.port === '587';
      const correctUser = smtpData.config.user === 'api';
      
      if (isMailtrap && correctPort && correctUser) {
        console.log('✅ Mailtrap configuration looks correct!\n');
      } else {
        console.log('❌ Configuration issues detected:');
        if (!isMailtrap) console.log(`  - Host should be: live.smtp.mailtrap.io (got: ${smtpData.config.host})`);
        if (!correctPort) console.log(`  - Port should be: 587 (got: ${smtpData.config.port})`);
        if (!correctUser) console.log(`  - User should be: api (got: ${smtpData.config.user})`);
        console.log();
      }
    }

    console.log('2️⃣ Testing email delivery...');
    const emailResponse = await fetch('https://globalpharmatrading.co.uk/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-test',
        email: 'mhamzawazir1996@gmail.com',
        name: 'Muhammad Hamza'
      })
    });

    const emailData = await emailResponse.json();
    console.log('Email Test Response:', JSON.stringify(emailData, null, 2));
    
    if (emailData.success) {
      console.log('\n🎉 SUCCESS! Test email sent via Mailtrap');
      console.log('📧 Check your inbox: mhamzawazir1996@gmail.com');
      
      // Test 2FA email
      console.log('\n3️⃣ Testing 2FA verification email...');
      const verifyResponse = await fetch('https://globalpharmatrading.co.uk/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'mhamzawazir1996@gmail.com'
        })
      });

      const verifyData = await verifyResponse.json();
      console.log('2FA Email Response:', JSON.stringify(verifyData, null, 2));
      
      if (verifyData.emailSent) {
        console.log('\n🎉🎉 COMPLETE SUCCESS!');
        console.log('✅ Mailtrap configuration working');
        console.log('✅ Test email delivered');
        console.log('✅ 2FA verification email sent');
        console.log('📧 Check your inbox for the verification code');
        console.log('\n🔐 You can now complete the 2FA login process!');
      } else {
        console.log('\n⚠️  Test email works but 2FA email failed');
        console.log('💡 Check the 2FA email sending logic');
      }
      
    } else {
      console.log('\n❌ Email delivery failed');
      console.log('Error:', emailData.message || emailData.error);
      
      if (emailData.error && emailData.error.includes('Invalid login')) {
        console.log('\n💡 SOLUTION: Check your Mailtrap API token');
        console.log('1. Go to https://mailtrap.io/');
        console.log('2. Navigate to Sending → API Tokens');
        console.log('3. Copy your API token');
        console.log('4. Update SMTP_PASS with: vercel env rm SMTP_PASS production && vercel env add SMTP_PASS production');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 NEXT STEPS IF FAILING:');
  console.log('1. Verify Mailtrap domain is confirmed');
  console.log('2. Check API token is correct and active');
  console.log('3. Ensure environment variables are set for Production');
  console.log('4. Try redeploying: vercel --prod');
}

testMailtrapEmail();
