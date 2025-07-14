import { NextResponse } from "next/server";
import { prisma, withDatabaseRetry } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";
import { generateToken } from "@/lib/auth";
import { getDashboardRoute } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    console.log("=== LOGIN API CALLED ===");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    
    const body = await req.json();
    console.log("=== LOGIN DEBUG ===");
    console.log("Request body:", body);
    
    // Validate input using Zod schema
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error.errors);
      return NextResponse.json({ 
        message: "Invalid input.", 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }

    const { email, password } = validationResult.data;
    console.log("Validated email:", email);

    // Find user with the updated schema
    console.log("Attempting to log in user:", email);
    let user;
    try {
      // Use retry mechanism for database operations
      user = await withDatabaseRetry(async () => {
        return await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            accountStatus: true,
            identityVerified: true,
            createdAt: true,
            updatedAt: true,
          }
        });
      }, 2, 1000); // 2 retries, 1 second delay
      
      console.log("Database query successful");
      
    } catch (dbError: any) {
      console.error("Database query failed after retries:", dbError);
      console.error("Error details:", {
        message: dbError?.message || 'Unknown error',
        code: dbError?.code || 'Unknown code',
        clientVersion: dbError?.clientVersion || 'Unknown version'
      });
      
      return NextResponse.json({ 
        message: "Database connection failed. Please try again in a moment." 
      }, { status: 503 });
    }

    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    console.log("User found:", user.email, "Role:", user.role);

    // Check if account is approved (new verification check)
    if (user.accountStatus === 'pending') {
      return NextResponse.json({ 
        message: "Your account is pending approval. Please wait for admin verification of your identity documents. You will receive an email once approved." 
      }, { status: 403 });
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'blocked') {
      return NextResponse.json({ 
        message: "Your account has been suspended. Please contact customer service for assistance." 
      }, { status: 403 });
    }

    // Check password
    const valid = await bcrypt.compare(password, user.password);
    console.log("Password check result:", valid);
    
    if (!valid) {
      console.log("Invalid password for user:", email);
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    console.log("Credentials verified successfully for:", user.email);

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
      console.log("2FA field not available, defaulting to false");
      twoFactorEnabled = false;
    }

    console.log("User 2FA enabled:", twoFactorEnabled);

    // If 2FA is enabled, return requiresVerification without setting auth cookie
    if (twoFactorEnabled) {
      return NextResponse.json({ 
        message: "Please check your email for verification code.",
        requiresVerification: true,
        emailSent: false, // Will be handled by separate endpoint
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'customer'
        },
        redirectUrl: getDashboardRoute(user.role || 'customer')
      }, { status: 200 });
    } else {
      // 2FA not enabled, proceed with direct login
      console.log("Generating JWT token...");
      
      let token;
      try {
        token = generateToken({
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || 'customer'
        });
        console.log("JWT token generated successfully");
      } catch (tokenError) {
        console.error("JWT token generation failed:", tokenError);
        return NextResponse.json({ 
          message: "Authentication token generation failed." 
        }, { status: 500 });
      }

      const response = NextResponse.json({ 
        message: "Login successful.",
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'customer'
        },
        redirectUrl: getDashboardRoute(user.role || 'customer')
      }, { status: 200 });

      // Set authentication cookie
      response.cookies.set("pharmacy_auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

  } catch (error: any) {
    console.error("=== LOGIN ERROR ===");
    console.error("Error type:", error?.constructor?.name || 'Unknown');
    console.error("Error message:", error?.message || 'Unknown error');
    console.error("Error stack:", error?.stack || 'No stack trace');
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ 
        message: "Invalid JSON in request body." 
      }, { status: 400 });
    }

    // Handle specific Prisma errors
    if (error?.code === 'P2002') {
      return NextResponse.json({ 
        message: "Database constraint error." 
      }, { status: 409 });
    }
    
    // Handle database connection errors
    if (error?.code === 'P1001' || error?.message?.includes('database')) {
      console.error("Database connection issue detected");
      return NextResponse.json({ 
        message: "Database temporarily unavailable." 
      }, { status: 503 });
    }
    
    // Handle JWT errors
    if (error?.message?.includes('JWT') || error?.message?.includes('secret')) {
      console.error("JWT configuration issue detected");
      return NextResponse.json({ 
        message: "Authentication configuration error." 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Internal server error.",
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}