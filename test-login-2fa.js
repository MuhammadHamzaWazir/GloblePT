#!/usr/bin/env node

// Test production 2FA flow by using the actual login endpoint
console.log('🔐 Testing 2FA Flow via Login');
console.log('');

async function testLoginWithEmail() {
  try {
    console.log('1. Testing login to trigger 2FA email...');
    
    // First, try to login with a user that should have 2FA enabled
    const loginResponse = await fetch('https://pharmacy-management-system-6oq0kuyke.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'admin123' // Common test password
      })
    });

    console.log('Login response status:', loginResponse.status);
    
    const loginText = await loginResponse.text();
    console.log('Raw login response:', loginText.substring(0, 500));
    
    try {
      const loginData = JSON.parse(loginText);
      console.log('Parsed login response:', loginData);
      
      if (loginData.requiresVerification) {
        console.log('✅ 2FA triggered! Email should be sent');
        console.log('📧 Check mhamzawazir1996@gmail.com for verification code');
        
        if (loginData.emailSent) {
          console.log('✅ Email delivery confirmed: SUCCESS');
        } else {
          console.log('❌ Email delivery failed:', loginData.message);
        }
      } else if (loginData.success) {
        console.log('ℹ️  Login successful without 2FA (2FA might be disabled)');
      } else {
        console.log('❌ Login failed:', loginData.message);
      }
      
    } catch (jsonError) {
      console.log('⚠️  Login response is not JSON');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginWithEmail();
