import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";
import { generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
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

    // Find user and include their role (with error handling for missing fields)
    console.log("Attempting to log in user:", email);
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        include: { role: true },
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
            updatedAt: true,
            role: true
          }
        });
      } catch (secondError) {
        console.error("Database connection failed:", secondError);
        return NextResponse.json({ 
          message: "Database temporarily unavailable." 
        }, { status: 503 });
      }
    }

    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    console.log("User found:", user.email, "Role:", user.role?.name);

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
          role: user.role?.name || 'USER'
        }
      }, { status: 200 });
    } else {
      // 2FA not enabled, proceed with direct login
      const token = generateToken({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role?.name || 'USER'
      });

      const response = NextResponse.json({ 
        message: "Login successful.",
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role?.name || 'USER'
        }
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

  } catch (error) {
    console.error("Login error:", error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ 
        message: "Invalid JSON in request body." 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      message: "Internal server error." 
    }, { status: 500 });
  }
}