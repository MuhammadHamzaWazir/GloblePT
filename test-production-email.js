#!/usr/bin/env node

console.log('🔍 Production Email Test for mhamzawazir1996@gmail.com');
console.log('');

async function testProductionEmail() {
  try {
    const response = await fetch('https://pharmacy-management-system-6oq0kuyke.vercel.app/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com'
      })
    });

    const data = await response.json();
    
    console.log('📡 API Response:');
    console.log('Status:', response.status);
    console.log('Message:', data.message || 'No message');
    console.log('Email Sent:', data.emailSent || false);
    console.log('');
    
    if (data.emailSent) {
      console.log('✅ SUCCESS: Email delivery is working!');
      console.log('📧 User should receive 2FA code within seconds');
      console.log('');
      console.log('🎯 NEXT STEPS:');
      console.log('1. Check mhamzawazir1996@gmail.com inbox/spam');
      console.log('2. Try logging in with 2FA enabled');
      console.log('3. Use verification code from email');
    } else {
      console.log('❌ Email delivery not working yet');
      console.log('');
      console.log('🔧 TROUBLESHOOTING:');
      console.log('1. Verify SMTP_USER is set to "apikey"');
      console.log('2. Verify SMTP_PASS is your SendGrid API key');
      console.log('3. Check SendGrid dashboard for sending activity');
      console.log('4. Verify sender domain noreply@globalpharmatrading.co.uk');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductionEmail();
