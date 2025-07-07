#!/usr/bin/env node

// Test the send-verification endpoint
async function testSendVerification() {
  try {
    console.log('📧 Testing send-verification endpoint...');
    
    const response = await fetch('http://localhost:3000/api/auth/send-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.emailSent) {
      console.log('✅ Email sent successfully!');
      console.log('📧 Check inbox for:', 'mhamzawazir1996@gmail.com');
    } else {
      console.log('❌ Email not sent');
      console.log('💬 Message:', data.message);
      
      // Look for verification code in development mode
      if (data.message.includes('For testing:')) {
        const codeMatch = data.message.match(/For testing: (\d{6})/);
        if (codeMatch) {
          console.log('🔑 Verification code for testing:', codeMatch[1]);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSendVerification();
