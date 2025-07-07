// Complete end-to-end test for email verification system
async function testCompleteFlow() {
  console.log('🚀 Starting Complete Email Verification Flow Test...\n');

  const testEmail = 'test@example.com';
  const baseUrl = 'http://localhost:3003';

  try {
    // Step 1: Send verification code
    console.log('📧 Step 1: Sending verification code...');
    const sendResponse = await fetch(`${baseUrl}/api/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    const sendData = await sendResponse.json();
    console.log('Send response:', sendData);
    console.log('Status:', sendResponse.status);

    if (sendResponse.status !== 200) {
      console.log('❌ Send verification failed');
      return;
    }

    // Step 2: Get demo verification code for reference
    console.log('\n🔍 Step 2: Getting demo verification code...');
    const demoResponse = await fetch(`${baseUrl}/api/auth/demo-verification`);
    const demoData = await demoResponse.json();
    console.log('Demo code example:', demoData.demo.verificationCode);
    
    // Step 3: Try common verification codes or use the demo pattern
    console.log('\n🔢 Step 3: Testing verification codes...');
    
    // Test codes to try (in a real scenario, the user would get this via email)
    const testCodes = [
      demoData.demo.verificationCode, // Use the demo code as reference
      '123456', '000000', '111111', '999999' // Common test codes
    ];

    for (const code of testCodes) {
      console.log(`\nTrying code: ${code}`);
      
      const verifyResponse = await fetch(`${baseUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, code })
      });

      const verifyData = await verifyResponse.json();
      console.log('Verify response:', verifyData);
      console.log('Status:', verifyResponse.status);

      if (verifyResponse.status === 200) {
        console.log('✅ Verification successful!');
        console.log('User data:', verifyData.user);
        break;
      } else {
        console.log(`❌ Code ${code} failed`);
      }
    }

    // Step 4: Test the login flow in the browser
    console.log('\n🌐 Step 4: Browser test instructions:');
    console.log('1. Open: http://localhost:3003/auth/login');
    console.log('2. Try logging in with any existing user credentials');
    console.log('3. The system should prompt for verification code');
    console.log('4. Check the server console for the verification code');
    console.log('5. Enter the code in the 2FA modal');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCompleteFlow();
