import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates, testEmailConfig } from '../../../lib/email';

// Test email sending functionality
export async function POST(req: NextRequest) {
  try {
    const { action, email, name } = await req.json();

    if (action === 'test-config') {
      // Test email configuration
      const isValid = await testEmailConfig();
      return NextResponse.json({
        success: isValid,
        message: isValid ? 'Email configuration is valid' : 'Email configuration failed',
        data: { configValid: isValid }
      });
    }

    if (action === 'send-test') {
      // Send a test email
      if (!email) {
        return NextResponse.json({
          success: false,
          message: 'Email address is required for test'
        }, { status: 400 });
      }

      const testEmailTemplate = {
        subject: 'Test Email - Pharmacy Mail Server',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🧪 Email Test Successful!</h2>
            <p>Hello ${name || 'there'},</p>
            <p>This is a test email to verify that the mail server configuration is working correctly.</p>
            
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">Test Details</h3>
              <ul style="color: #1e40af;">
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Recipient:</strong> ${email}</li>
                <li><strong>Server:</strong> ${process.env.NODE_ENV || 'development'} environment</li>
              </ul>
            </div>
            
            <p>If you received this email, your mail server is configured correctly! ✅</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
              <p>This is a test email from Global Pharmacy</p>
            </div>
          </div>
        `,
        text: `
          Email Test Successful!
          
          Hello ${name || 'there'},
          
          This is a test email to verify that the mail server configuration is working correctly.
          
          Test Details:
          - Time: ${new Date().toLocaleString()}
          - Recipient: ${email}
          - Server: ${process.env.NODE_ENV || 'development'} environment
          
          If you received this email, your mail server is configured correctly!
          
          This is a test email from Global Pharmacy
        `
      };

      const result = await sendEmail({
        to: email,
        subject: testEmailTemplate.subject,
        html: testEmailTemplate.html,
        text: testEmailTemplate.text
      });

      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
        data: {
          messageId: result.messageId,
          previewUrl: result.previewUrl,
          recipient: email,
          sentAt: new Date().toISOString()
        }
      });
    }

    if (action === 'send-contact-test') {
      // Test the contact form email templates
      const testData = {
        name: name || 'Test User',
        email: email || 'test@example.com',
        message: 'This is a test message to verify the contact form email templates are working correctly. Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      };

      // Send both admin notification and customer confirmation
      const adminTemplate = emailTemplates.contactForm(testData);
      const customerTemplate = emailTemplates.contactConfirmation(testData);

      const adminResult = await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@globalpharmacy.com',
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        text: adminTemplate.text
      });

      const customerResult = await sendEmail({
        to: testData.email,
        subject: customerTemplate.subject,
        html: customerTemplate.html,
        text: customerTemplate.text
      });

      return NextResponse.json({
        success: true,
        message: 'Contact form test emails sent successfully',
        data: {
          adminEmail: {
            messageId: adminResult.messageId,
            previewUrl: adminResult.previewUrl
          },
          customerEmail: {
            messageId: customerResult.messageId,
            previewUrl: customerResult.previewUrl
          },
          testData,
          sentAt: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Supported actions: test-config, send-test, send-contact-test'
    }, { status: 400 });

  } catch (error) {
    console.error('Email test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Email test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Get email configuration status
export async function GET() {
  try {
    const configStatus = await testEmailConfig();
    
    return NextResponse.json({
      success: true,
      data: {
        emailConfigured: configStatus,
        environment: process.env.NODE_ENV || 'development',
        smtpHost: process.env.SMTP_HOST || 'smtp.ethereal.email (default)',
        smtpPort: process.env.SMTP_PORT || '587 (default)',
        hasCredentials: !!(process.env.SMTP_USER && process.env.SMTP_PASS),
        adminEmail: process.env.ADMIN_EMAIL || 'admin@globalpharmacy.com (default)'
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to check email configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
