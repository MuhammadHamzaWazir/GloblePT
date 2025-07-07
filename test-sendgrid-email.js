#!/usr/bin/env node

// Test SendGrid API key and email sending
async function testSendGridEmail() {
  console.log('📧 TESTING SENDGRID EMAIL DELIVERY');
  console.log('==================================\n');

  try {
    console.log('1️⃣ Testing actual email send via API...');
    
    const response = await fetch('https://globalpharmatrading.co.uk/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'mhamzawazir1996@gmail.com',
        subject: 'Test Email from Production',
        message: 'This is a test email to verify SendGrid configuration is working.'
      })
    });

    console.log('API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API Response:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('\n🎉 SUCCESS! Email sent via SendGrid');
        console.log('📧 Check your inbox: mhamzawazir1996@gmail.com');
        console.log('✅ SendGrid API key is working correctly');
      } else {
        console.log('\n❌ Email API call failed');
        console.log('💡 Check the error message above');
      }
    } else {
      console.log('\n❌ HTTP Error:', response.status);
      const errorText = await response.text();
      console.log('Error:', errorText);
    }

    // Now test the 2FA verification email
    console.log('\n2️⃣ Testing 2FA verification email...');
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
    } else {
      console.log('\n❌ 2FA email still not being sent');
      console.log('💡 There may be an issue with the verification email logic');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 TROUBLESHOOTING GUIDE:');
  console.log('If test email works but 2FA doesn\'t:');
  console.log('- Check verification email template');
  console.log('- Check 2FA email sending logic');
  console.log('- Verify email address is correct');
  console.log('');
  console.log('If no emails work:');
  console.log('- Check SendGrid API key is valid');
  console.log('- Check SMTP_PASS environment variable');
  console.log('- Verify SendGrid account is active');
}

testSendGridEmail();
