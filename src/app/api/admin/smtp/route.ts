import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { adminKey, action, smtpConfig } = await request.json();
    
    // Simple admin key check
    if (adminKey !== 'global-pharma-admin-2024') {
      return NextResponse.json({ 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    if (action === 'check-config') {
      // Check current SMTP configuration
      const config = {
        hasHost: !!process.env.SMTP_HOST,
        hasPort: !!process.env.SMTP_PORT,
        hasUser: !!process.env.SMTP_USER,
        hasPass: !!process.env.SMTP_PASS,
        hasFrom: !!process.env.SMTP_FROM,
        host: process.env.SMTP_HOST || 'NOT_SET',
        port: process.env.SMTP_PORT || 'NOT_SET',
        user: process.env.SMTP_USER || 'NOT_SET',
        from: process.env.SMTP_FROM || 'NOT_SET'
      };

      const allConfigured = config.hasHost && config.hasPort && config.hasUser && config.hasPass && config.hasFrom;

      return NextResponse.json({
        success: true,
        message: allConfigured ? 'SMTP configuration complete' : 'SMTP configuration incomplete',
        config,
        allConfigured,
        missingVars: [
          !config.hasHost && 'SMTP_HOST',
          !config.hasPort && 'SMTP_PORT', 
          !config.hasUser && 'SMTP_USER',
          !config.hasPass && 'SMTP_PASS',
          !config.hasFrom && 'SMTP_FROM'
        ].filter(Boolean)
      }, { status: 200 });
    }

    if (action === 'test-smtp') {
      // Test SMTP connection
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return NextResponse.json({
          success: false,
          message: 'SMTP configuration missing',
          error: 'Required environment variables: SMTP_HOST, SMTP_USER, SMTP_PASS'
        }, { status: 400 });
      }

      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER?.trim(),
            pass: process.env.SMTP_PASS?.trim()
          }
        });

        await transporter.verify();

        return NextResponse.json({
          success: true,
          message: 'SMTP connection successful'
        }, { status: 200 });

      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'SMTP connection failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    if (action === 'send-test-email') {
      const { to } = await request.json();
      
      if (!to) {
        return NextResponse.json({
          success: false,
          message: 'Email address required'
        }, { status: 400 });
      }

      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER?.trim(),
            pass: process.env.SMTP_PASS?.trim()
          }
        });

        const result = await transporter.sendMail({
          from: process.env.SMTP_FROM || 'noreply@globalpharmatrading.co.uk',
          to: to,
          subject: 'Test Email from Global Pharma Trading',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
                <h1 style="margin: 0;">🎉 Email System Working!</h1>
              </div>
              <div style="padding: 20px; background-color: #f8fafc;">
                <p>This is a test email to confirm that the SMTP configuration is working correctly.</p>
                <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
                <p><strong>From:</strong> Global Pharma Trading Email System</p>
              </div>
            </div>
          `,
          text: 'This is a test email to confirm that the SMTP configuration is working correctly.'
        });

        return NextResponse.json({
          success: true,
          message: 'Test email sent successfully',
          messageId: result.messageId
        }, { status: 200 });

      } catch (error) {
        return NextResponse.json({
          success: false,
          message: 'Failed to send test email',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      message: 'Invalid action. Supported: check-config, test-smtp, send-test-email'
    }, { status: 400 });

  } catch (error) {
    console.error("SMTP admin error:", error);
    return NextResponse.json({ 
      success: false,
      message: "Internal server error.",
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
