import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extract form data
    const { name, email, password, address, phone, dateOfBirth } = body;

    console.log('Registration attempt for:', email);

    // Validate required fields
    if (!name || !email || !password || !address) {
      return NextResponse.json({ 
        message: "Missing required fields: name, email, password, and address are required." 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        message: "Invalid email format." 
      }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ 
        message: "Password must be at least 6 characters long." 
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ 
        message: "User with this email already exists." 
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with verified status for simplified registration
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        accountStatus: "verified", // Simplified - auto-verify for now
        role: "customer",
        identityVerified: true, // Simplified
        ageVerified: true, // Simplified
      }
    });

    console.log('User created successfully:', user.email);

    return NextResponse.json({
      message: "Registration successful! You can now log in.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus
      },
      requiresApproval: false
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      message: `Registration failed: ${error.message}` 
    }, { status: 500 });
  }
}
