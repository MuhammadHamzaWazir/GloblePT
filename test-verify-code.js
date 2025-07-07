#!/usr/bin/env node

// Test the verify-code endpoint
async function testVerifyCode() {
  try {
    console.log('🔐 Testing verify-code endpoint...');
    
    const response = await fetch('http://localhost:3000/api/auth/verify-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        code: '635485' // Use the code from the previous test
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.success) {
      console.log('✅ Verification successful!');
      console.log('🔑 User should now be logged in');
      console.log('🍪 Auth cookie should be set');
    } else {
      console.log('❌ Verification failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVerifyCode();
