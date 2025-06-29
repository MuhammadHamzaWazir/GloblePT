import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

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

    // Find user and include their role
    console.log("Attempting to log in user:", email);
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

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

    // Generate JWT token
    const token = generateToken({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role?.name || 'USER'
    });

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set("pharmacy_auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    console.log("User authenticated successfully:", user.email);

    return NextResponse.json({ 
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role?.name || 'USER'
      }
    }, { status: 200 });

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