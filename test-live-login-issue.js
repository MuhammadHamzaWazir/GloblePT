#!/usr/bin/env node

// Test the exact live login behavior
async function testLiveLoginIssue() {
  console.log('🌐 Testing Live Login Issue');
  console.log('URL: https://globalpharmatrading.co.uk/auth/login');
  console.log('='.repeat(60));
  
  try {
    console.log('1️⃣ Testing current live login behavior...');
    console.log('Email: mhamzawazir1996@gmail.com');
    console.log('Password: Test123!');
    
    const response = await fetch('https://globalpharmatrading.co.uk/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'Test123!'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    // Check what's actually happening
    if (data.requiresVerification) {
      console.log('✅ 2FA is correctly triggered');
      console.log('📧 Email sent status:', data.emailSent);
      
      // If 2FA is triggered, test the send-verification endpoint
      console.log('\n2️⃣ Testing send-verification endpoint...');
      const verifyResponse = await fetch('https://globalpharmatrading.co.uk/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'mhamzawazir1996@gmail.com'
        })
      });
      
      const verifyData = await verifyResponse.json();
      console.log('Send-verification response:', JSON.stringify(verifyData, null, 2));
      
    } else if (data.success) {
      console.log('❌ User logged in directly without 2FA');
      console.log('💡 This means 2FA is disabled for this user in production');
      
    } else {
      console.log('❌ Login failed completely');
      console.log('💡 Wrong credentials or other error');
    }
    
    // Also test with a different approach - check if we can access a protected route
    console.log('\n3️⃣ Testing if user can access protected area...');
    const dashboardResponse = await fetch('https://globalpharmatrading.co.uk/dashboard', {
      credentials: 'include'
    });
    console.log('Dashboard access status:', dashboardResponse.status);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DIAGNOSIS:');
  console.log('If user logs in directly without 2FA modal:');
  console.log('- User exists but 2FA is disabled in production DB');
  console.log('- Need to enable 2FA for production user');
  console.log('');
  console.log('If login fails completely:');
  console.log('- Wrong password or user doesn\'t exist');
  console.log('- Need to create/update user in production DB');
  console.log('');
  console.log('If 2FA modal appears but no email:');
  console.log('- 2FA enabled but email delivery failing');
  console.log('- SendGrid configuration issue');
}

testLiveLoginIssue();
