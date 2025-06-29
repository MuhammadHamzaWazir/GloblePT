import nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  // For development/testing - using Ethereal Email (fake SMTP)
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal.pass'
  }
};

// For production, you would use a service like:
// - Gmail: smtp.gmail.com:587
// - SendGrid: smtp.sendgrid.net:587
// - Amazon SES: email-smtp.region.amazonaws.com:587
// - Outlook: smtp-mail.outlook.com:587

// Create reusable transporter object
let transporter: nodemailer.Transporter;

const createTransporter = async () => {
  if (!transporter) {
    // For development/testing - create Ethereal test account
    if (process.env.NODE_ENV !== 'production' && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
      console.log('Creating test email account...');
      const testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('Test email account created:', {
        user: testAccount.user,
        pass: testAccount.pass,
        web: 'https://ethereal.email'
      });
    } else {
      // Use configured SMTP settings
      transporter = nodemailer.createTransport(emailConfig);
    }
  }
  return transporter;
};

// Email templates
export const emailTemplates = {
  contactForm: (data: { name: string; email: string; message: string }) => ({
    subject: `New Contact Form Submission from ${data.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Contact Details</h3>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #374151;">Message</h3>
          <p style="line-height: 1.6; color: #6b7280;">${data.message.replace(/\n/g, '<br>')}</p>
        </div>
        
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This email was sent from the Pharmacy Contact Form</p>
          <p>Please reply directly to: ${data.email}</p>
        </div>
      </div>
    `,
    text: `
      New Contact Form Submission
      
      Name: ${data.name}
      Email: ${data.email}
      Submitted: ${new Date().toLocaleString()}
      
      Message:
      ${data.message}
      
      Please reply directly to: ${data.email}
    `
  }),

  contactConfirmation: (data: { name: string }) => ({
    subject: 'Thank you for contacting us - Global Pharmacy',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          Thank You for Contacting Us
        </h2>
        
        <p>Dear ${data.name},</p>
        
        <p>Thank you for reaching out to Global Pharmacy. We have received your message and will get back to you as soon as possible.</p>
        
        <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">What happens next?</h3>
          <ul style="color: #1e40af;">
            <li>Our team will review your message</li>
            <li>We typically respond within 24-48 hours</li>
            <li>For urgent matters, please call us directly</li>
          </ul>
        </div>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #374151;">Contact Information</h4>
          <p style="margin: 5px 0;"><strong>Phone:</strong> +44 123 456 7890</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> info@globalpharmacy.com</p>
          <p style="margin: 5px 0;"><strong>Address:</strong> 123 Pharmacy Street, London, UK</p>
        </div>
        
        <p>Best regards,<br>
        <strong>Global Pharmacy Team</strong></p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
          <p>This is an automated confirmation email. Please do not reply to this email.</p>
        </div>
      </div>
    `,
    text: `
      Thank You for Contacting Us - Global Pharmacy
      
      Dear ${data.name},
      
      Thank you for reaching out to Global Pharmacy. We have received your message and will get back to you as soon as possible.
      
      What happens next?
      - Our team will review your message
      - We typically respond within 24-48 hours
      - For urgent matters, please call us directly
      
      Contact Information:
      Phone: +44 123 456 7890
      Email: info@globalpharmacy.com
      Address: 123 Pharmacy Street, London, UK
      
      Best regards,
      Global Pharmacy Team
      
      This is an automated confirmation email.
    `
  })
};

// Send email function
export const sendEmail = async (options: {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}) => {
  try {
    const emailTransporter = await createTransporter();
    
    const mailOptions = {
      from: options.from || process.env.SMTP_FROM || '"Global Pharmacy" <noreply@globalpharmacy.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await emailTransporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: options.to,
      subject: options.subject
    });

    // For development with Ethereal, log the preview URL
    if (process.env.NODE_ENV !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('Preview URL:', previewUrl);
        return { ...info, previewUrl };
      }
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const emailTransporter = await createTransporter();
    await emailTransporter.verify();
    console.log('Email configuration is valid');
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
