#!/usr/bin/env node

const baseUrl = 'https://globalpharmatrading.co.uk';

async function testEmailDelivery() {
  console.log('📧 TESTING EMAIL DELIVERY AFTER VERCEL ENV FIX');
  console.log('===============================================\n');

  try {
    // First check SMTP configuration
    console.log('1️⃣ Checking SMTP configuration...');
    const smtpResponse = await fetch(`${baseUrl}/api/admin/smtp`);
    const smtpData = await smtpResponse.json();
    
    console.log('SMTP Config Status:', smtpResponse.status);
    console.log('SMTP Config:', JSON.stringify(smtpData, null, 2));
    
    if (!smtpData.success || !smtpData.allConfigured) {
      console.log('❌ SMTP configuration is still incorrect!');
      console.log('Please run: node fix-vercel-env-vars.js for instructions');
      return;
    }
    
    // Check if the host is correct now
    if (smtpData.config.host !== 'smtp.sendgrid.net') {
      console.log('❌ SMTP_HOST is still incorrect!');
      console.log(`Current: ${smtpData.config.host}`);
      console.log('Expected: smtp.sendgrid.net');
      return;
    }
    
    // Check if the user is correct now
    if (smtpData.config.user.trim() !== 'apikey') {
      console.log('❌ SMTP_USER is still incorrect!');
      console.log(`Current: "${smtpData.config.user}"`);
      console.log('Expected: "apikey"');
      return;
    }
    
    console.log('✅ SMTP configuration looks correct now!\n');
    
    // Test sending an actual email
    console.log('2️⃣ Testing email sending...');
    const emailResponse = await fetch(`${baseUrl}/api/admin/smtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: true,
        to: 'mhamzawazir1996@gmail.com',
        subject: 'Test Email After SMTP Fix',
        message: 'This is a test email to verify that SMTP is working correctly after the Vercel environment variable fix.'
      })
    });
    
    const emailData = await emailResponse.json();
    console.log('Email Test Status:', emailResponse.status);
    console.log('Email Test Result:', JSON.stringify(emailData, null, 2));
    
    if (emailData.success) {
      console.log('\n✅ EMAIL DELIVERY IS NOW WORKING!');
      console.log('Check your inbox for the test email.');
      console.log('\n3️⃣ Testing 2FA login flow...');
      
      // Test the 2FA login flow
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'mhamzawazir1996@gmail.com',
          password: 'Test123!'
        })
      });
      
      const loginData = await loginResponse.json();
      console.log('2FA Login Status:', loginResponse.status);
      console.log('2FA Login Result:', JSON.stringify(loginData, null, 2));
      
      if (loginData.requiresVerification) {
        console.log('\n✅ 2FA FLOW IS WORKING!');
        console.log('- Login triggers 2FA requirement');
        console.log('- Check your email for the 2FA verification code');
        console.log('- Use the code in the 2FA modal to complete login');
      }
      
    } else {
      console.log('\n❌ Email delivery is still not working');
      console.log('Error:', emailData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailDelivery();
