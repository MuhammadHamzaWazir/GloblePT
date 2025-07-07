#!/usr/bin/env node

// Test login with the correct credentials
async function testLogin() {
  console.log('🔐 Testing login with correct credentials...');
  console.log('');
  
  try {
    // Test with mhamzawazir1996@gmail.com (2FA enabled)
    console.log('1. Testing mhamzawazir1996@gmail.com with 2FA...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'password123'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.requiresVerification) {
      console.log('✅ 2FA triggered successfully!');
      console.log('📧 Email delivery status:', data.emailSent ? 'SUCCESS' : 'FAILED');
      console.log('💬 Message:', data.message);
      
      if (!data.emailSent) {
        console.log('🔑 Use master code for verification: AD16C9');
      }
    } else if (data.success) {
      console.log('⚠️  Login successful without 2FA (unexpected)');
    } else {
      console.log('❌ Login failed:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('');
    console.log('ℹ️  Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

testLogin();
