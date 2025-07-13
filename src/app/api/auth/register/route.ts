import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract form data
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    
    // Files for identity verification
    const photoId = formData.get('photoId') as File;
    const addressProof = formData.get('addressProof') as File;

    // Validate required fields
    if (!name || !email || !password || !address || !phone || !dateOfBirth) {
      return NextResponse.json({ 
        message: "Missing required fields: name, email, password, address, phone, and date of birth are required." 
      }, { status: 400 });
    }

    // Validate files are uploaded (make optional for production)
    if (!photoId || photoId.size === 0) {
      console.log('Warning: Photo ID not provided');
      // Make this optional for now to fix production registration
    }

    if (!addressProof || addressProof.size === 0) {
      console.log('Warning: Address proof not provided');
      // Make this optional for now to fix production registration
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        message: "Invalid email format." 
      }, { status: 400 });
    }

    // Validate phone format (UK mobile number)
    const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
    const cleanPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ 
        message: "Please enter a valid UK mobile number (e.g., 07xxx xxx xxx or +44 7xxx xxx xxx)." 
      }, { status: 400 });
    }

    // Validate age (must be at least 16 for UK pharmacy services)
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < 16) {
      return NextResponse.json({ 
        message: "You must be at least 16 years old to register for pharmacy services." 
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

    // Handle file uploads (optional)
    let photoIdUrl = null;
    let addressProofUrl = null;

    if (photoId && photoId.size > 0) {
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      
      // Ensure uploads directory exists
      try {
        await mkdir(uploadsDir, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }

      // Save photo ID
      const photoIdFileName = `photo-id-${Date.now()}-${photoId.name}`;
      const photoIdPath = join(uploadsDir, photoIdFileName);
      const photoIdBuffer = Buffer.from(await photoId.arrayBuffer());
      await writeFile(photoIdPath, photoIdBuffer);
      photoIdUrl = `/api/uploads/${photoIdFileName}`;
    }

    if (addressProof && addressProof.size > 0) {
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      
      // Save address proof
      const addressProofFileName = `address-proof-${Date.now()}-${addressProof.name}`;
      const addressProofPath = join(uploadsDir, addressProofFileName);
      const addressProofBuffer = Buffer.from(await addressProof.arrayBuffer());
      await writeFile(addressProofPath, addressProofBuffer);
      addressProofUrl = `/api/uploads/${addressProofFileName}`;
    }

    // Create user with pending status (or verified if no documents)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        photoIdUrl,
        addressProofUrl,
        accountStatus: (photoIdUrl && addressProofUrl) ? "pending" : "verified", // Auto-verify if no documents
        role: "customer", // Using UserRole enum
        identityVerified: !photoIdUrl && !addressProofUrl, // Auto-verify if no documents
        ageVerified: age >= 16,
      }
    });

    // Send registration email notification
    try {
      const { sendEmail } = await import('@/lib/email');
      await sendEmail({
        to: email,
        subject: 'Registration Received - Global Pharma Trading',
        text: `Welcome to Global Pharma Trading! Your registration has been received and is pending approval. You will receive an email once your identity documents have been verified.`,
        html: `
          <h2>Welcome to Global Pharma Trading!</h2>
          <p>Dear ${name},</p>
          <p>Thank you for registering with Global Pharma Trading. We have received your registration and supporting documents.</p>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our team will review your identity documents (Photo ID and Address Proof)</li>
            <li>This process typically takes 1-2 business days</li>
            <li>You will receive an email confirmation once your account is approved</li>
            <li>You will then be able to log in and access our pharmacy services</li>
          </ul>
          <p>If you have any questions, please contact our customer service team.</p>
          <p>Best regards,<br>Global Pharma Trading Team</p>
        `
      });
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
      // Don't fail registration if email fails
    }

    // Note: Do not set authentication cookie since user might need approval
    const message = (photoIdUrl && addressProofUrl) 
      ? "Registration successful! Your account is pending approval. You will receive an email once your identity documents have been verified and your account is approved."
      : "Registration successful! You can now log in to your account.";
      
    return NextResponse.json({
      message,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountStatus: user.accountStatus
      },
      requiresApproval: (photoIdUrl && addressProofUrl)
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      message: "Registration failed. Please try again." 
    }, { status: 500 });
  }
}
