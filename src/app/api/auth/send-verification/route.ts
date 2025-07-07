import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { verificationStore } from "@/lib/verification-store";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Find user (with error handling for missing fields)
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email }
      });
    } catch (dbError) {
      console.log("Database schema not yet migrated, checking with basic fields only");
      try {
        user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            roleId: true,
            createdAt: true,
            updatedAt: true
          }
        });
      } catch (secondError) {
        console.error("Database connection failed:", secondError);
        return NextResponse.json({ 
          message: "Database temporarily unavailable. Using fallback verification system." 
        }, { status: 503 });
      }
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ message: "If this email exists, a verification code has been sent." }, { status: 200 });
    }

    // Check if user can send another code
    if (!verificationStore.canSendCode(email)) {
      return NextResponse.json({ 
        message: "Too many verification attempts. Please try again later." 
      }, { status: 429 });
    }

    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Store verification code in temporary store
    verificationStore.set(email, verificationCode, expiryTime);

    // Try to update database if fields exist, otherwise skip
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationCode: verificationCode,
          emailVerificationCodeExpiry: expiryTime,
          emailVerificationAttempts: 1,
          lastEmailVerificationSent: new Date()
        } as any
      });
    } catch (updateError) {
      console.log("Database fields not available yet, using in-memory store");
    }

    // Send verification email
    let emailSent = false;
    let emailError = null;
    
    try {
      await sendEmail({
        to: user.email,
        subject: "Your Global Pharma Trading Login Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">Global Pharma Trading</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">Login Verification</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
              <h2 style="color: #374151; margin-top: 0;">Login Verification Required</h2>
              <p style="color: #6b7280; line-height: 1.6;">Hello ${user.name},</p>
              <p style="color: #6b7280; line-height: 1.6;">Someone is trying to log into your Global Pharma Trading account. To complete the login process, please use the verification code below:</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px;">
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #16a34a; font-family: monospace;">${verificationCode}</div>
              </div>
              
              <p style="color: #6b7280; line-height: 1.6;"><strong>Important:</strong></p>
              <ul style="color: #6b7280; line-height: 1.6;">
                <li>This code will expire in 10 minutes</li>
                <li>Never share this code with anyone</li>
                <li>If you didn't try to log in, please contact us immediately</li>
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-top: 20px;">
              <p style="margin: 0; color: #92400e;"><strong>Security Notice:</strong> If you didn't request this verification code, someone may be trying to access your account. Please contact our support team immediately.</p>
            </div>
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
              <p>Global Pharma Trading</p>
              <p><strong>Unit 42b Bowlers Croft, Basildon, Essex, SS14 3ED</strong></p>
              <p>Phone: <a href="tel:07950938398">07950 938398</a> | Email: <a href="mailto:contact@globalpharmatrading.co.uk">contact@globalpharmatrading.co.uk</a></p>
            </div>
          </div>
        `,
        text: `
          GLOBAL PHARMA TRADING - Login Verification
          
          Hello ${user.name},
          
          Someone is trying to log into your Global Pharma Trading account. To complete the login process, please use this verification code:
          
          ${verificationCode}
          
          This code will expire in 10 minutes.
          
          IMPORTANT:
          - Never share this code with anyone
          - If you didn't try to log in, please contact us immediately
          
          Global Pharma Trading
          Unit 42b Bowlers Croft, Basildon, Essex, SS14 3ED
          Phone: 07950 938398
          Email: contact@globalpharmatrading.co.uk
        `
      });
      emailSent = true;
    } catch (emailError_) {
      console.error("Failed to send verification email:", emailError_);
      emailError = emailError_ instanceof Error ? emailError_.message : 'Unknown email error';
      // Continue without failing - code is still stored and valid
    }

    // For testing purposes, log the verification code in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🧪 TEST: Verification code for ${email}: ${verificationCode}`);
    }

    return NextResponse.json({ 
      message: emailSent 
        ? "Verification code sent to your email address."
        : `Verification code generated. ${process.env.NODE_ENV !== 'production' ? `For testing: ${verificationCode}` : 'Email system temporarily unavailable - please contact support.'}`,
      expiresIn: 600, // 10 minutes in seconds
      emailSent,
      ...(emailError && process.env.NODE_ENV !== 'production' && { emailError })
    }, { status: 200 });

  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json({ 
      message: "Internal server error." 
    }, { status: 500 });
  }
}
