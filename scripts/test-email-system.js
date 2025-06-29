const nodemailer = require('nodemailer');

async function testEmailConfiguration() {
  console.log('🧪 Testing Email Configuration...\n');

  try {
    // Create test account
    console.log('📧 Creating test email account...');
    const testAccount = await nodemailer.createTestAccount();
    
    console.log('✅ Test account created:');
    console.log(`   User: ${testAccount.user}`);
    console.log(`   Pass: ${testAccount.pass}`);
    console.log(`   SMTP: smtp.ethereal.email:587`);
    console.log(`   Web: https://ethereal.email\n`);

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    // Verify connection
    console.log('🔗 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified!\n');

    // Test email 1: Admin notification
    console.log('📨 Sending test admin notification email...');
    const adminEmail = {
      from: testAccount.user,
      to: 'admin@globalpharmacy.com',
      subject: 'Test Admin Notification - Contact Form',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Test Contact Form Submission
          </h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Details</h3>
            <p><strong>Name:</strong> Test User</p>
            <p><strong>Email:</strong> test@example.com</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="margin-top: 0; color: #374151;">Message</h3>
            <p style="line-height: 1.6; color: #6b7280;">This is a test message to verify that the email system is working correctly. The contact form should send this type of notification to administrators.</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>This email was sent from the Pharmacy Contact Form</p>
            <p>Please reply directly to: test@example.com</p>
          </div>
        </div>
      `,
      text: `
        Test Contact Form Submission
        
        Name: Test User
        Email: test@example.com
        Submitted: ${new Date().toLocaleString()}
        
        Message:
        This is a test message to verify that the email system is working correctly.
        
        Please reply directly to: test@example.com
      `
    };

    const adminResult = await transporter.sendMail(adminEmail);
    console.log('✅ Admin email sent!');
    console.log(`   Message ID: ${adminResult.messageId}`);
    console.log(`   Preview: ${nodemailer.getTestMessageUrl(adminResult)}\n`);

    // Test email 2: Customer confirmation
    console.log('📨 Sending test customer confirmation email...');
    const customerEmail = {
      from: testAccount.user,
      to: 'test@example.com',
      subject: 'Thank you for contacting us - Global Pharmacy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            Thank You for Contacting Us!
          </h2>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; color: #1e40af;">
              Dear Test User,
            </p>
          </div>
          
          <div style="line-height: 1.6; color: #374151;">
            <p>Thank you for reaching out to Global Pharmacy! We have received your message and will get back to you as soon as possible.</p>
            
            <p>Our team typically responds to inquiries within 24-48 hours during business days. If your matter is urgent, please don't hesitate to call us directly.</p>
            
            <p>We appreciate your interest in our services and look forward to assisting you.</p>
          </div>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #374151;">Contact Information</h3>
            <p style="margin: 5px 0;"><strong>Phone:</strong> +44 123 456 7890</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> info@globalpharmacy.com</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> 123 Pharmacy Street, London, UK</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px;">
              Best regards,<br>
              <strong style="color: #2563eb;">Global Pharmacy Team</strong>
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
            <p>This is an automated confirmation email. Please do not reply to this message.</p>
          </div>
        </div>
      `,
      text: `
        Thank You for Contacting Us!
        
        Dear Test User,
        
        Thank you for reaching out to Global Pharmacy! We have received your message and will get back to you as soon as possible.
        
        Our team typically responds to inquiries within 24-48 hours during business days. If your matter is urgent, please don't hesitate to call us directly.
        
        Contact Information:
        Phone: +44 123 456 7890
        Email: info@globalpharmacy.com
        Address: 123 Pharmacy Street, London, UK
        
        Best regards,
        Global Pharmacy Team
        
        This is an automated confirmation email. Please do not reply to this message.
      `
    };

    const customerResult = await transporter.sendMail(customerEmail);
    console.log('✅ Customer email sent!');
    console.log(`   Message ID: ${customerResult.messageId}`);
    console.log(`   Preview: ${nodemailer.getTestMessageUrl(customerResult)}\n`);

    // Summary
    console.log('🎉 Email System Test Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Test Account Details:');
    console.log(`   Username: ${testAccount.user}`);
    console.log(`   Password: ${testAccount.pass}`);
    console.log(`   Webmail: https://ethereal.email`);
    console.log('');
    console.log('📨 Email Previews:');
    console.log(`   Admin: ${nodemailer.getTestMessageUrl(adminResult)}`);
    console.log(`   Customer: ${nodemailer.getTestMessageUrl(customerResult)}`);
    console.log('');
    console.log('✅ All emails sent successfully!');
    console.log('✅ Mail server configuration is working correctly!');

  } catch (error) {
    console.error('❌ Email test failed:', error);
    process.exit(1);
  }
}

// Test Contact Form API
async function testContactFormAPI() {
  console.log('\n🧪 Testing Contact Form API...\n');

  try {
    const testData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'This is a test message from the automated test script to verify that the contact form API and email sending are working correctly.'
    };

    console.log('📡 Sending POST request to /api/contact...');
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('✅ Contact form API test successful!');
      
      if (data.data.emailStatus) {
        console.log('📧 Email Status:');
        console.log(`   Admin Email: ${data.data.emailStatus.adminSent ? '✅ Sent' : '❌ Failed'}`);
        console.log(`   Customer Email: ${data.data.emailStatus.customerSent ? '✅ Sent' : '❌ Failed'}`);
        
        if (data.data.emailStatus.adminPreview) {
          console.log(`   Admin Preview: ${data.data.emailStatus.adminPreview}`);
        }
        if (data.data.emailStatus.customerPreview) {
          console.log(`   Customer Preview: ${data.data.emailStatus.customerPreview}`);
        }
        if (data.data.emailStatus.error) {
          console.log(`   Error: ${data.data.emailStatus.error}`);
        }
      }
    } else {
      console.log('❌ Contact form API test failed:', data.message);
    }

  } catch (error) {
    console.error('❌ Contact form API test failed:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Email System Tests...\n');
  
  await testEmailConfiguration();
  await testContactFormAPI();
  
  console.log('\n🏁 All tests completed!');
}

runTests().catch(console.error);
