import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { sendEmail, emailTemplates } from '../../../lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, recaptchaToken } = await req.json();
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name, email, and message are required' 
      }, { status: 400 });
    }

    // Validate reCAPTCHA (only if configured)
    const isRecaptchaConfigured = process.env.RECAPTCHA_SECRET_KEY && 
                                  process.env.RECAPTCHA_SECRET_KEY !== 'your_recaptcha_secret_key_here';
    
    if (isRecaptchaConfigured && !recaptchaToken) {
      return NextResponse.json({ 
        success: false, 
        message: 'Please complete the reCAPTCHA verification' 
      }, { status: 400 });
    }

    // Verify reCAPTCHA with Google (only if configured)
    if (isRecaptchaConfigured && recaptchaToken) {
      const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
      try {
        const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `secret=${recaptchaSecret}&response=${recaptchaToken}`,
        });

        const recaptchaResult = await recaptchaResponse.json();
        
        if (!recaptchaResult.success) {
          return NextResponse.json({ 
            success: false, 
            message: 'reCAPTCHA verification failed. Please try again.' 
          }, { status: 400 });
        }
      } catch (recaptchaError) {
        console.error('reCAPTCHA verification error:', recaptchaError);
        return NextResponse.json({ 
          success: false, 
          message: 'reCAPTCHA verification failed. Please try again.' 
        }, { status: 400 });
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      }, { status: 400 });
    }

    // Save contact to database
    const contact = await prisma.contact.create({ 
      data: { 
        name: name.trim(), 
        email: email.trim().toLowerCase(), 
        message: message.trim() 
      } 
    });

    // Send email notifications
    try {
      // 1. Send notification to Global Pharma Trading contact email
      const adminTemplate = emailTemplates.contactForm({ name, email, message });
      const adminEmail = 'contact@globalpharmatrading.co.uk';
      
      const adminEmailResult = await sendEmail({
        to: adminEmail,
        subject: adminTemplate.subject,
        html: adminTemplate.html,
        text: adminTemplate.text
      });

      // 2. Send confirmation to customer
      const customerTemplate = emailTemplates.contactConfirmation({ name });
      
      const customerEmailResult = await sendEmail({
        to: email,
        subject: customerTemplate.subject,
        html: customerTemplate.html,
        text: customerTemplate.text
      });

      console.log('Emails sent successfully:', {
        admin: adminEmailResult.messageId,
        customer: customerEmailResult.messageId,
        adminPreview: adminEmailResult.previewUrl,
        customerPreview: customerEmailResult.previewUrl
      });

      return NextResponse.json({
        success: true,
        message: 'Contact form submitted successfully. You will receive a confirmation email shortly.',
        data: { 
          contact,
          emailStatus: {
            adminSent: true,
            customerSent: true,
            adminPreview: adminEmailResult.previewUrl,
            customerPreview: customerEmailResult.previewUrl
          }
        }
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Still return success since contact was saved, but note email failure
      return NextResponse.json({
        success: true,
        message: 'Contact form submitted successfully, but email notification failed.',
        data: { 
          contact,
          emailStatus: {
            adminSent: false,
            customerSent: false,
            error: emailError instanceof Error ? emailError.message : 'Email sending failed'
          }
        }
      });
    }

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to submit contact form. Please try again.' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({ 
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent 50 contacts
    });
    
    return NextResponse.json({
      success: true,
      data: { contacts }
    });
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch contacts' 
    }, { status: 500 });
  }
}
