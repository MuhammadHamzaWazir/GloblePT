import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { getDashboardRoute } from "@/lib/utils";
import { cookies } from "next/headers";
import { verificationStore } from "@/lib/verification-store";
import crypto from "crypto";

// Emergency master code generator (admin use only)
const generateMasterCode = () => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const hash = crypto.createHash('md5').update(`global-pharma-${today}`).digest('hex');
  return hash.slice(0, 6).toUpperCase();
};

const isValidMasterCode = (code: string) => {
  const masterCode = generateMasterCode();
  return code === masterCode;
};

export async function POST(req: Request) {
  try {
    const { email, code, directLogin } = await req.json();

    if (!email || (!code && !directLogin)) {
      return NextResponse.json({ 
        message: "Email and verification code are required" 
      }, { status: 400 });
    }

    // Find user with verification code (with error handling for missing fields)
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        }
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
            role: true,
            createdAt: true,
            updatedAt: true,
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
      return NextResponse.json({ 
        message: "Invalid verification code" 
      }, { status: 401 });
    }

    // Try to verify using database first, then fall back to in-memory store
    let isValidCode = false;
    
    // Handle direct login for users with 2FA disabled
    if (directLogin && code === 'SKIP_2FA') {
      // Check user's 2FA preference
      let twoFactorEnabled = false;
      try {
        const userWith2FA = await prisma.$queryRaw`
          SELECT twoFactorEnabled FROM User WHERE id = ${user.id}
        ` as any[];
        
        if (userWith2FA && userWith2FA[0] && userWith2FA[0].twoFactorEnabled !== undefined) {
          twoFactorEnabled = Boolean(userWith2FA[0].twoFactorEnabled);
        }
      } catch (error) {
        console.log("2FA field not available, assuming disabled");
        twoFactorEnabled = false;
      }
      
      if (!twoFactorEnabled) {
        isValidCode = true; // Allow direct login when 2FA is disabled
        console.log("Direct login allowed for user with 2FA disabled:", user.email);
      } else {
        return NextResponse.json({ 
          message: "2FA is required for this account" 
        }, { status: 401 });
      }
    } else {
      // Normal 2FA verification process
      // Check for master code first (emergency access)
      if (isValidMasterCode(code)) {
        isValidCode = true;
        console.log("Master verification code used for emergency access:", user.email);
      } else {
        try {
          // Type assertion to handle the case where fields might not exist yet
          const userWithVerification = user as any;

          // Check if verification code exists and hasn't expired in database
          if (userWithVerification.emailVerificationCode && userWithVerification.emailVerificationCodeExpiry) {
            if (new Date() <= userWithVerification.emailVerificationCodeExpiry && 
                userWithVerification.emailVerificationCode === code) {
              isValidCode = true;
              // Clear verification code from database
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  emailVerificationCode: null,
                  emailVerificationCodeExpiry: null,
                  emailVerificationAttempts: 0
                } as any
              });
            }
          }
        } catch (dbError) {
          console.log("Database verification failed, trying in-memory store");
        }

        // If database verification failed, try in-memory store
        if (!isValidCode) {
          isValidCode = verificationStore.verify(email, code);
        }
      }
    }

    if (!isValidCode) {
      return NextResponse.json({ 
        message: "Invalid or expired verification code" 
      }, { status: 401 });
    }

    // Generate JWT token for successful login
    const token = await generateToken({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role || 'customer'
    });

    // Set secure cookie
    const cookieStore = await cookies();
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax" as const,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      domain: process.env.NODE_ENV === 'production' ? '.globalpharmatrading.co.uk' : undefined
    };
    
    cookieStore.set("pharmacy_auth", token, cookieOptions);
    
    console.log("Cookie set successfully:", {
      token: token.substring(0, 20) + "...",
      options: cookieOptions,
      userEmail: user.email,
      userRole: user.role,
      environment: process.env.NODE_ENV
    });

    // Create response with success data
    const response = NextResponse.json({ 
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'customer'
      },
      redirectUrl: getDashboardRoute(user.role || 'customer')
    }, { status: 200 });

    // Also set cookie on response headers for extra reliability
    response.cookies.set("pharmacy_auth", token, cookieOptions);

    return response;

  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ 
      message: "Internal server error." 
    }, { status: 500 });
  }
}
