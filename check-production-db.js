#!/usr/bin/env node

// Test production database to see what users exist
async function checkProductionDatabase() {
  console.log('🔍 Checking Production Database Users');
  console.log('='.repeat(50));
  
  try {
    // Try to access a test endpoint or create a simple test
    console.log('🌐 Production URL: https://globalpharmatrading.co.uk');
    console.log('');
    
    // Test if the user exists by trying to send verification to different emails
    const testEmails = [
      'mhamzawazir1996@gmail.com',
      'admin@pharmacy.com',
      'test@example.com'
    ];
    
    for (const email of testEmails) {
      console.log(`📧 Testing email: ${email}`);
      
      try {
        const response = await fetch('https://globalpharmatrading.co.uk/api/auth/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        console.log(`   Status: ${response.status}`);
        console.log(`   Message: ${data.message}`);
        
        // If it says "If this email exists", it means the API is working but user might not exist
        // If it generates a code, the user exists
        if (data.message.includes('For testing:') || data.message.includes('Verification code')) {
          console.log(`   ✅ User EXISTS`);
        } else if (data.message.includes('If this email exists')) {
          console.log(`   ❓ User might not exist (security message)`);
        } else {
          console.log(`   ⚠️  Unclear status`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      console.log('');
    }
    
    console.log('💡 Analysis:');
    console.log('- Production database might be different from local');
    console.log('- User mhamzawazir1996@gmail.com might not exist in production');
    console.log('- Or user might exist but have 2FA disabled');
    console.log('');
    console.log('🎯 Solutions:');
    console.log('1. Create the user in production database');
    console.log('2. Enable 2FA for the user in production');
    console.log('3. Use a different test account');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

checkProductionDatabase();
