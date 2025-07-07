#!/usr/bin/env node

// Test SendGrid email with correct parameters
async function testSendGridFinal() {
  console.log('📧 FINAL SENDGRID EMAIL TEST');
  console.log('============================\n');

  try {
    console.log('1️⃣ Testing actual email delivery...');
    
    const response = await fetch('https://globalpharmatrading.co.uk/api/test-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send-test',
        email: 'mhamzawazir1996@gmail.com',
        name: 'Muhammad Hamza'
      })
    });

    console.log('API Status:', response.status);
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n🎉 SUCCESS! Test email sent to your inbox!');
      console.log('📧 Check: mhamzawazir1996@gmail.com');
      console.log('✅ SendGrid is working perfectly');
      
      // Now test 2FA email
      console.log('\n2️⃣ Testing 2FA verification email...');
      const verifyResponse = await fetch('https://globalpharmatrading.co.uk/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'mhamzawazir1996@gmail.com'
        })
      });

      const verifyData = await verifyResponse.json();
      console.log('2FA Response:', JSON.stringify(verifyData, null, 2));
      
      if (verifyData.emailSent) {
        console.log('\n🎉🎉 COMPLETE SUCCESS! 2FA emails working!');
        console.log('📧 Check your inbox for the verification code');
        console.log('🔐 You can now complete the full 2FA login process');
        console.log('\n✅ PROBLEM SOLVED: 2FA code delivery is working!');
      } else {
        console.log('\n❌ 2FA email still not working');
        console.log('💡 SendGrid works, but verification email logic needs fixing');
      }
      
    } else {
      console.log('\n❌ Test email failed');
      console.log('Error:', data.message);
      console.log('💡 SendGrid API key might be invalid');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSendGridFinal();
