import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    console.log('🔍 Fallback registration API - Processing request...');
    
    // Try to parse as JSON first, then FormData
    let data: any;
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await req.json();
    } else {
      // Handle FormData
      const formData = await req.formData();
      data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        address: formData.get('address') as string,
        phone: formData.get('phone') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
      };
    }
    
    // Extract form data
    const { name, email, password, address, phone, dateOfBirth } = data;

    console.log('🔍 Fallback registration data received:', {
      name: name ? 'provided' : 'missing',
      email: email ? 'provided' : 'missing',
      password: password ? 'provided' : 'missing',
      address: address ? 'provided' : 'missing',
      phone: phone ? 'provided' : 'missing',
      dateOfBirth: dateOfBirth ? 'provided' : 'missing'
    });

    // Validate required fields
    if (!name || !email || !password || !address) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        message: "Missing required fields: name, email, password, and address are required." 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
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

    // Validate phone format if provided (UK mobile number)
    if (phone) {
      const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
      if (!phoneRegex.test(phone)) {
        console.log('❌ Invalid phone format:', phone);
        return NextResponse.json({ 
          message: "Please enter a valid UK mobile number (e.g., 07xxx xxx xxx or +44 7xxx xxx xxx)." 
        }, { status: 400 });
      }
    }

    // Validate age if date of birth is provided (must be at least 16 for UK pharmacy services)
    let age = 18; // Default age for users without birth date
    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 16) {
        console.log('❌ User too young:', age);
        return NextResponse.json({ 
          message: "You must be at least 16 years old to register for pharmacy services." 
        }, { status: 400 });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json({ 
        message: "User with this email already exists." 
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with verified status for fallback registration
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        accountStatus: "verified", // Auto-verify for fallback
        role: "customer",
        identityVerified: true, // Auto-verify for fallback
        ageVerified: age >= 16,
      }
    });

    console.log('✅ Fallback user created successfully:', user.email);

    // Send registration email notification
    try {
      const { sendEmail } = await import('@/lib/email');
      await sendEmail({
        to: email,
        subject: 'Registration Successful - Global Pharma Trading',
        text: `Welcome to Global Pharma Trading! Your account has been created and verified. You can now log in and access our pharmacy services.`,
        html: `
          <h2>Welcome to Global Pharma Trading!</h2>
          <p>Dear ${name},</p>
          <p>Your account has been successfully created and verified!</p>
          <p><strong>You can now:</strong></p>
          <ul>
            <li>Log in to your account</li>
            <li>Browse our pharmacy services</li>
            <li>Place prescription orders</li>
            <li>Access your customer dashboard</li>
          </ul>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/login" style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a></p>
          <p>If you have any questions, please contact our customer service team.</p>
          <p>Best regards,<br>Global Pharma Trading Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      message: "Registration successful! You can now log in to your account.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus
      },
      requiresApproval: false
    });

  } catch (error: any) {
    console.error('❌ Fallback registration error:', error);
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        message: "User with this email already exists." 
      }, { status: 409 });
    }
    
    if (error.name === 'ValidationError') {
      return NextResponse.json({ 
        message: `Validation error: ${error.message}` 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: `Registration failed: ${error.message || 'Please try again.'}` 
    }, { status: 500 });
  }
}
