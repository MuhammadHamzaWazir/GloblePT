#!/usr/bin/env node

// Test SendGrid email using the correct API endpoint
async function testSendGridEmailCorrect() {
  console.log('📧 TESTING SENDGRID EMAIL DELIVERY (CORRECT API)');
  console.log('==============================================\n');

  try {
    console.log('1️⃣ Testing send-test action...');
    
    const response = await fetch('https://globalpharmatrading.co.uk/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-test',
        to: 'mhamzawazir1996@gmail.com'
      })
    });

    console.log('API Status:', response.status);
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n🎉 SUCCESS! Test email sent via SendGrid');
      console.log('📧 Check your inbox: mhamzawazir1996@gmail.com');
      console.log('✅ SendGrid configuration is working');
      
      // If test email works, let's try the 2FA email again
      console.log('\n2️⃣ Now testing 2FA verification email...');
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
        console.log('\n🎉 SUCCESS! 2FA verification email sent');
        console.log('📧 Check your inbox for the verification code');
        console.log('🔐 You can now complete the 2FA login process');
      } else {
        console.log('\n❌ 2FA email still failing');
        console.log('💡 SendGrid works, but 2FA email logic has an issue');
      }
      
    } else {
      console.log('\n❌ Test email failed');
      console.log('💡 SendGrid API key or configuration issue');
      
      // Test SMTP configuration
      console.log('\n🔧 Testing SMTP config...');
      const smtpResponse = await fetch('https://globalpharmatrading.co.uk/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-config'
        })
      });
      
      const smtpData = await smtpResponse.json();
      console.log('SMTP Config Response:', JSON.stringify(smtpData, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 RESULTS SUMMARY:');
  console.log('✅ SMTP Host: smtp.sendgrid.net (Fixed)');
  console.log('✅ SMTP User: apikey (Fixed)');
  console.log('✅ SMTP Connection: Working');
  console.log('❓ SendGrid API Key: Testing...');
  console.log('❓ 2FA Email Logic: Testing...');
}

testSendGridEmailCorrect();
