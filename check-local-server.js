#!/usr/bin/env node

// Check if local server is running and on which port
async function checkLocalServer() {
  console.log('🔍 CHECKING LOCAL DEVELOPMENT SERVER');
  console.log('====================================\n');

  const ports = [3000, 3001, 3002, 3003];
  
  for (const port of ports) {
    try {
      console.log(`Checking port ${port}...`);
      const response = await fetch(`http://localhost:${port}/`, {
        signal: AbortSignal.timeout(2000)
      });
      
      if (response.ok) {
        console.log(`✅ Server found on port ${port}`);
        
        // Test API endpoint
        try {
          const apiResponse = await fetch(`http://localhost:${port}/api/admin/smtp`);
          if (apiResponse.ok) {
            console.log(`✅ API endpoints working on port ${port}`);
            console.log(`🌐 Local server URL: http://localhost:${port}`);
            
            // Now test the 2FA functionality
            console.log('\n📧 Testing 2FA on local server...');
            await testLocal2FA(port);
            return;
          }
        } catch (apiError) {
          console.log(`⚠️  Server running but API not responding on port ${port}`);
        }
      }
    } catch (error) {
      console.log(`❌ No server on port ${port}`);
    }
  }
  
  console.log('\n❌ No local server found on common ports');
  console.log('💡 Make sure to start the development server:');
  console.log('   npm run dev');
}

async function testLocal2FA(port) {
  try {
    // Test SMTP config
    console.log('1️⃣ Checking SMTP configuration...');
    const smtpResponse = await fetch(`http://localhost:${port}/api/admin/smtp`);
    const smtpData = await smtpResponse.json();
    console.log('SMTP Config:', JSON.stringify(smtpData.config, null, 2));
    
    // Test 2FA login
    console.log('\n2️⃣ Testing 2FA login...');
    const loginResponse = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'Test123!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', JSON.stringify(loginData, null, 2));
    
    if (loginData.requiresVerification) {
      console.log('\n✅ 2FA triggered successfully');
      console.log('📧 Email sent status:', loginData.emailSent);
      
      if (loginData.emailSent) {
        console.log('🎉 SUCCESS! 2FA email sent from local server');
        console.log('📧 Check the console logs for Ethereal email preview URL');
      } else {
        console.log('❌ 2FA email not sent - check SMTP configuration');
      }
    } else {
      console.log('❌ 2FA not triggered - check user 2FA settings');
    }
    
  } catch (error) {
    console.error('❌ Local 2FA test failed:', error.message);
  }
}

checkLocalServer();
