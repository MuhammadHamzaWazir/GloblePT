#!/usr/bin/env node

// Test 2FA setup and email sending locally with better error handling
async function testLocal2FASimple() {
  console.log('🧪 SIMPLE LOCAL 2FA EMAIL TEST');
  console.log('===============================\n');

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test basic server connectivity
    console.log('1️⃣ Testing server connectivity...');
    const healthCheck = await fetch(`${baseUrl}/`, {
      signal: AbortSignal.timeout(5000)
    });
    
    if (healthCheck.ok) {
      console.log('✅ Local server is responding\n');
    } else {
      throw new Error('Server not responding');
    }

    // Test API endpoint availability
    console.log('2️⃣ Testing API endpoints...');
    try {
      const apiTest = await fetch(`${baseUrl}/api/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test-config' }),
        signal: AbortSignal.timeout(5000)
      });
      
      if (apiTest.ok) {
        const apiData = await apiTest.json();
        console.log('✅ API endpoints working');
        console.log('Email config status:', apiData.message);
      }
    } catch (apiError) {
      console.log('⚠️  API test failed:', apiError.message);
    }

    // Enable 2FA for test user
    console.log('\n3️⃣ Enabling 2FA for test user...');
    const enable2FAResponse = await fetch(`${baseUrl}/api/admin/enable-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        enable: true
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (enable2FAResponse.ok) {
      const enable2FAData = await enable2FAResponse.json();
      console.log('2FA Enable Response:', enable2FAData.message);
    }

    // Test 2FA login flow
    console.log('\n4️⃣ Testing 2FA login flow...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'Test123!'
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login Response:', JSON.stringify(loginData, null, 2));

      if (loginData.requiresVerification) {
        console.log('\n✅ 2FA correctly triggered locally');
        
        if (loginData.emailSent) {
          console.log('🎉 SUCCESS! 2FA email sent from local server');
          console.log('📧 Using Ethereal Email - check server console for preview URL');
          console.log('💡 Look for a line like: "Preview URL: https://ethereal.email/message/..."');
        } else {
          console.log('❌ 2FA triggered but email not sent');
          console.log('💡 Check server console logs for email errors');
        }

        // Try sending verification email directly
        console.log('\n5️⃣ Testing direct verification email...');
        const verifyResponse = await fetch(`${baseUrl}/api/auth/send-verification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'mhamzawazir1996@gmail.com'
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          console.log('Direct Verification Response:', JSON.stringify(verifyData, null, 2));
        }

      } else {
        console.log('❌ 2FA not triggered');
        console.log('💡 User might not exist or 2FA not enabled');
      }
    } else {
      console.log('❌ Login request failed:', loginResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('========================');
    console.log('1. Check if npm run dev is running without errors');
    console.log('2. Check server console for any error messages');
    console.log('3. Verify database connection in .env file');
    console.log('4. Make sure user exists in local database');
    console.log('5. Check if 2FA fields exist in user table');
  }

  console.log('\n📋 WHAT TO LOOK FOR:');
  console.log('=====================');
  console.log('- Server console should show email sending attempts');
  console.log('- Look for Ethereal Email preview URLs in console');
  console.log('- Check for any SMTP connection errors');
  console.log('- Verify 2FA is enabled for the user');
}

testLocal2FASimple();
