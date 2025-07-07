import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  try {
    // Generate a demo verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    return NextResponse.json({
      success: true,
      message: "Email verification system is working!",
      demoCode: verificationCode, // Add this for easy access
      demo: {
        verificationCode,
        expiresAt: expiryTime,
        expiresIn: 600,
        emailTemplate: {
          subject: "Your Global Pharma Trading Login Verification Code",
          preview: `Hello [User Name], your verification code is: ${verificationCode}`
        }
      },
      features: [
        "✅ 6-digit code generation",
        "✅ 10-minute expiration",
        "✅ Rate limiting (5 codes per day)",
        "✅ Professional email templates",
        "✅ Security warnings",
        "✅ Auto-cleanup of expired codes"
      ],
      apis: {
        sendVerification: "/api/auth/send-verification",
        verifyCode: "/api/auth/verify-code"
      },
      testInstructions: [
        "1. Go to /auth/login",
        "2. Enter valid user credentials",
        "3. System sends verification code",
        "4. Enter code in 2FA modal",
        "5. Successful login redirects to dashboard"
      ]
    });
  } catch (error) {
    console.error("Demo error:", error);
    return NextResponse.json({ 
      success: false,
      message: "Demo failed" 
    }, { status: 500 });
  }
}
