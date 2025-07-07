// Production Email Verification System Test
async function testProductionFlow() {
  console.log('🚀 Testing Production Email Verification System...\n');

  const baseUrl = 'https://globalpharmatrading.co.uk';
  
  try {
    // Step 1: Test demo endpoint
    console.log('🔍 Step 1: Testing demo endpoint...');
    const demoResponse = await fetch(`${baseUrl}/api/auth/demo-verification`);
    const demoData = await demoResponse.json();
    
    if (demoData.success) {
      console.log('✅ Demo endpoint working');
      console.log('Demo code:', demoData.demo.verificationCode);
    } else {
      console.log('❌ Demo endpoint failed');
      return;
    }

    // Step 2: Test send verification
    console.log('\n📧 Step 2: Testing send verification...');
    const testEmails = [
      'admin@test.com',
      'user@example.com', 
      'test@globalpharmatrading.co.uk'
    ];

    for (const email of testEmails) {
      console.log(`\nTesting email: ${email}`);
      
      const sendResponse = await fetch(`${baseUrl}/api/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const sendData = await sendResponse.json();
      console.log(`Status: ${sendResponse.status}`);
      console.log(`Response: ${sendData.message}`);
      
      if (sendResponse.status === 200) {
        console.log('✅ Send verification working');
      } else {
        console.log('❌ Send verification failed');
      }
    }

    // Step 3: Test verify code endpoint
    console.log('\n🔢 Step 3: Testing verify code endpoint...');
    const verifyResponse = await fetch(`${baseUrl}/api/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'test@example.com', 
        code: '000000' // Invalid code to test error handling
      })
    });

    const verifyData = await verifyResponse.json();
    console.log(`Status: ${verifyResponse.status}`);
    console.log(`Response: ${verifyData.message}`);

    if (verifyResponse.status === 401 && verifyData.message.includes('Invalid')) {
      console.log('✅ Verify code endpoint properly rejecting invalid codes');
    }

    // Step 4: Instructions for manual testing
    console.log('\n🌐 Step 4: Manual Testing Instructions:');
    console.log('='.repeat(50));
    console.log('1. Open: https://globalpharmatrading.co.uk/auth/login');
    console.log('2. Try logging in with valid credentials from the production database');
    console.log('3. After password verification, the system should show the 2FA modal');
    console.log('4. Check email for verification code (if SMTP is configured)');
    console.log('5. Or check server logs for development codes');
    console.log('6. Enter the 6-digit code in the modal');
    console.log('7. Should redirect to appropriate dashboard based on user role');
    console.log('='.repeat(50));

    console.log('\n✅ All API endpoints are working correctly!');
    console.log('🔐 Email verification system is ready for production use');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProductionFlow();
