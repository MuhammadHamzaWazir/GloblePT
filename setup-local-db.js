#!/usr/bin/env node

// Setup local database and test user for 2FA testing
async function setupLocalDatabase() {
  console.log('🛠️  LOCAL DATABASE SETUP FOR 2FA TESTING');
  console.log('==========================================\n');

  const baseUrl = 'http://localhost:3000';
  
  try {
    // Check database connection
    console.log('1️⃣ Checking database connection...');
    const dbResponse = await fetch(`${baseUrl}/api/admin/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check' })
    });

    if (dbResponse.ok) {
      const dbData = await dbResponse.json();
      console.log('Database status:', dbData.message);
    } else {
      console.log('❌ Database check failed');
    }

    // Create test user if needed
    console.log('\n2️⃣ Creating/updating test user...');
    const createUserResponse = await fetch(`${baseUrl}/api/admin/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'Test123!',
        name: 'Muhammad Hamza Wazir'
      })
    });

    if (createUserResponse.ok) {
      const userData = await createUserResponse.json();
      console.log('User setup:', userData.message);
    }

    // Enable 2FA for the user
    console.log('\n3️⃣ Enabling 2FA for test user...');
    const enable2FAResponse = await fetch(`${baseUrl}/api/admin/enable-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        enable: true
      })
    });

    if (enable2FAResponse.ok) {
      const enable2FAData = await enable2FAResponse.json();
      console.log('2FA setup:', enable2FAData.message);
    }

    // Test email configuration
    console.log('\n4️⃣ Testing email configuration...');
    const emailConfigResponse = await fetch(`${baseUrl}/api/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'test-config' })
    });

    if (emailConfigResponse.ok) {
      const emailConfigData = await emailConfigResponse.json();
      console.log('Email config:', emailConfigData.message);
      
      if (emailConfigData.success) {
        console.log('✅ Email configuration is working');
        
        // Now test 2FA login
        console.log('\n5️⃣ Testing 2FA login...');
        const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'mhamzawazir1996@gmail.com',
            password: 'Test123!'
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log('Login Response:', JSON.stringify(loginData, null, 2));

          if (loginData.requiresVerification) {
            console.log('\n🎉 SUCCESS! 2FA is working locally');
            
            if (loginData.emailSent) {
              console.log('📧 2FA email sent successfully');
              console.log('💡 Check your development server console for Ethereal email preview URL');
              console.log('🔗 It will look like: "Preview URL: https://ethereal.email/message/..."');
            } else {
              console.log('⚠️  2FA triggered but email not sent');
              console.log('💡 Check server console for email errors');
            }
          } else {
            console.log('❌ 2FA not triggered');
          }
        } else {
          const errorData = await loginResponse.json();
          console.log('❌ Login failed:', errorData.message);
        }
      } else {
        console.log('❌ Email configuration failed');
        console.log('💡 Check .env file SMTP settings');
      }
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }

  console.log('\n📋 LOCAL DEVELOPMENT NOTES:');
  console.log('============================');
  console.log('- Using Ethereal Email for local testing (fake SMTP)');
  console.log('- Emails won\'t be delivered to real inbox');
  console.log('- Check server console for preview URLs');
  console.log('- Preview URLs let you see the email content');
  console.log('- Perfect for testing 2FA email templates and content');
}

setupLocalDatabase();
