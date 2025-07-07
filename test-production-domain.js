#!/usr/bin/env node

// Test 2FA flow using the actual production domain
console.log('🌐 Testing 2FA with Production Domain');
console.log('');

async function testProductionDomain() {
  try {
    console.log('Testing: https://globalpharmatrading.co.uk');
    
    // Test login to trigger 2FA
    const loginResponse = await fetch('https://globalpharmatrading.co.uk/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'admin123'
      })
    });

    console.log('Production domain login status:', loginResponse.status);
    
    const loginText = await loginResponse.text();
    
    try {
      const loginData = JSON.parse(loginText);
      console.log('Production login response:', loginData);
      
      if (loginData.requiresVerification) {
        console.log('✅ 2FA TRIGGERED ON PRODUCTION!');
        console.log('📧 Email delivery status:', loginData.emailSent ? 'SUCCESS' : 'FAILED');
        
        if (loginData.emailSent) {
          console.log('🎉 EMAIL DELIVERY IS WORKING!');
          console.log('📨 User mhamzawazir1996@gmail.com should receive 2FA code');
        } else {
          console.log('❌ Email delivery failed:', loginData.message);
        }
      } else if (loginData.success) {
        console.log('ℹ️  Login successful without 2FA (user has 2FA disabled)');
      } else {
        console.log('❌ Login failed:', loginData.message);
      }
      
    } catch (jsonError) {
      console.log('Response is not JSON, likely an error page');
      console.log('Response preview:', loginText.substring(0, 200));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductionDomain();
