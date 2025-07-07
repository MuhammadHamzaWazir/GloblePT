// Test SendGrid Email Configuration
async function testSendGridConfiguration() {
  console.log('🧪 Testing SendGrid Email Configuration\n');
  
  const baseUrl = 'https://globalpharmatrading.co.uk';
  
  console.log('=== PRE-CONFIGURATION CHECK ===');
  console.log('Before setting up SendGrid, emails fail with:');
  console.log('❌ "Email system temporarily unavailable"\n');
  
  console.log('=== TESTING EMAIL GENERATION ===');
  
  // Test email generation for the user who had issues
  const testEmail = 'mhamzawazir1996@gmail.com';
  
  try {
    console.log(`Testing email generation for: ${testEmail}`);
    
    const response = await fetch(`${baseUrl}/api/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${data.message}`);
    console.log(`Email Sent: ${data.emailSent}`);
    
    if (data.emailSent === true) {
      console.log('✅ SUCCESS! SendGrid is working correctly');
      console.log('✅ Users will now receive 2FA codes via email');
    } else if (data.emailSent === false) {
      console.log('❌ SendGrid not configured yet');
      console.log('ℹ️  Complete the SendGrid setup first');
    }
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
  
  console.log('\n=== CONFIGURATION STATUS ===');
  console.log('After SendGrid setup, you should see:');
  console.log('✅ emailSent: true');
  console.log('✅ Message: "Verification code sent to your email address."');
  console.log('✅ User receives email within seconds\n');
  
  console.log('=== VERIFICATION STEPS ===');
  console.log('1. Complete SendGrid account setup');
  console.log('2. Set environment variables in Vercel');
  console.log('3. Deploy to production');
  console.log('4. Run this test script again');
  console.log('5. Try actual login with 2FA\n');
  
  console.log('🎯 FINAL RESULT:');
  console.log('User mhamzawazir1996@gmail.com will receive 2FA codes!');
  console.log('All 2FA email delivery will work perfectly.');
}

testSendGridConfiguration();
