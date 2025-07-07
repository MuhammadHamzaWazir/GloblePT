// Test the complete 2FA flow in production
async function test2FAFlow() {
  console.log('🧪 Testing 2FA Flow in Production...\n');

  const baseUrl = 'https://globalpharmatrading.co.uk';
  
  // Test with a known working email first
  const testEmail = 'admin@globalpharmatrading.co.uk';
  const testPassword = 'Admin123!';
  
  console.log('=== STEP 1: Test Login ===');
  try {
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail, 
        password: testPassword 
      })
    });

    const loginData = await loginResponse.json();
    console.log(`Login Status: ${loginResponse.status}`);
    console.log('Login Response:', JSON.stringify(loginData, null, 2));
    
    if (loginResponse.ok) {
      console.log(`✅ Login successful`);
      console.log(`🔐 2FA Required: ${loginData.requiresTwoFactor}`);
      
      if (loginData.requiresTwoFactor) {
        console.log('🚨 2FA is enabled for this user');
      } else {
        console.log('✅ 2FA is disabled, direct login successful');
      }
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
  
  console.log('\n=== STEP 2: Test Profile API ===');
  try {
    // We can't test profile without proper auth cookie, but we can test the endpoint structure
    const profileResponse = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`Profile Status: ${profileResponse.status}`);
    
    if (profileResponse.status === 401) {
      console.log('✅ Profile endpoint properly requires authentication');
    } else {
      const profileData = await profileResponse.json();
      console.log('Profile Response:', JSON.stringify(profileData, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Profile test failed:', error.message);
  }

  console.log('\n=== STEP 3: Test Email Verification ===');
  try {
    const verifyResponse = await fetch(`${baseUrl}/api/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'mhamzawazir1996@gmail.com' 
      })
    });

    const verifyData = await verifyResponse.json();
    console.log(`Send Verification Status: ${verifyResponse.status}`);
    console.log('Send Verification Response:', JSON.stringify(verifyData, null, 2));
    
    if (verifyResponse.ok) {
      console.log('✅ Email verification endpoint working');
    } else if (verifyResponse.status === 500) {
      console.log('🚨 Internal server error - check email configuration');
    }
    
  } catch (error) {
    console.error('❌ Email verification test failed:', error.message);
  }

  console.log('\n=== STEP 4: Test Direct Login (2FA Disabled) ===');
  try {
    const directLoginResponse = await fetch(`${baseUrl}/api/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: testEmail,
        code: '',
        directLogin: true
      })
    });

    const directLoginData = await directLoginResponse.json();
    console.log(`Direct Login Status: ${directLoginResponse.status}`);
    console.log('Direct Login Response:', JSON.stringify(directLoginData, null, 2));
    
    if (directLoginResponse.ok) {
      console.log('✅ Direct login (2FA disabled) working');
    }
    
  } catch (error) {
    console.error('❌ Direct login test failed:', error.message);
  }
}

// Run the test
test2FAFlow().catch(console.error);
