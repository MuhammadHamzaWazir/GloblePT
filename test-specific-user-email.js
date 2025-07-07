// Test email delivery for specific user
async function testSpecificUserEmail() {
  console.log('🧪 Testing Email Delivery for Specific User...\n');

  const testEmail = 'mhamzawazir1996@gmail.com';
  const baseUrl = 'https://globalpharmatrading.co.uk';
  
  try {
    console.log(`📧 Testing email delivery for: ${testEmail}`);
    
    // Test 1: Send verification code
    console.log('\n1. Sending verification code...');
    const response = await fetch(`${baseUrl}/api/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${data.message}`);
    
    if (response.status === 200) {
      console.log('✅ API call successful');
      
      // Check if email was actually sent
      if (data.emailSent === false) {
        console.log('⚠️  Email was not sent - likely SMTP configuration issue');
        console.log('💡 Check email configuration in environment variables');
      } else if (data.emailSent === true) {
        console.log('✅ Email was sent successfully');
      } else {
        console.log('ℹ️  Email status not reported in response');
      }
      
      // Check for development code in response
      if (data.message && data.message.includes('For testing:')) {
        const codeMatch = data.message.match(/For testing: (\d{6})/);
        if (codeMatch) {
          console.log(`🔢 Development code: ${codeMatch[1]}`);
        }
      }
    } else {
      console.log('❌ API call failed');
    }

    // Test 2: Check demo endpoint for reference
    console.log('\n2. Getting demo verification code for reference...');
    const demoResponse = await fetch(`${baseUrl}/api/auth/demo-verification`);
    const demoData = await demoResponse.json();
    
    if (demoData.success) {
      console.log(`📱 Demo code (for reference): ${demoData.demo.verificationCode}`);
    }

    // Test 3: Manual testing instructions
    console.log('\n3. Manual Testing Steps:');
    console.log('='.repeat(50));
    console.log('a) Check your email inbox and spam folder');
    console.log('b) Look for email from: noreply@pharmacy.com');
    console.log('c) Subject: "Your Global Pharma Trading Login Verification Code"');
    console.log('d) If no email received, check server logs for SMTP errors');
    console.log('e) For testing, you can use the demo code above');
    console.log('='.repeat(50));

    // Test 4: Email configuration check
    console.log('\n4. Email Configuration Diagnosis:');
    console.log('The system is configured to send emails via SMTP.');
    console.log('If emails are not being delivered, possible causes:');
    console.log('- SMTP server credentials not configured');
    console.log('- SMTP server rejecting emails');
    console.log('- Email provider blocking the sender');
    console.log('- Network/firewall issues');
    console.log('\nFor immediate testing, you can:');
    console.log('- Use the demo verification code shown above');
    console.log('- Check the browser developer console for any logged codes');
    console.log('- Contact admin to configure production SMTP settings');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSpecificUserEmail();
