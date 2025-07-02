import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    // Extract form data
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const address = formData.get('address') as string;
    const dateOfBirth = formData.get('dateOfBirth') as string;
    const nationalInsuranceNumber = formData.get('nationalInsuranceNumber') as string;
    const nhsNumber = formData.get('nhsNumber') as string;
    
    // Files for identity verification
    const photoId = formData.get('photoId') as File;
    const addressProof = formData.get('addressProof') as File;
    
    // Medical history data (stored as JSON in existing fields for now)
    const currentMedications = formData.get('currentMedications') as string;
    const allergies = formData.get('allergies') as string;
    const medicalConditions = formData.get('medicalConditions') as string;
    const isPregnant = formData.get('isPregnant') === 'true';
    const isBreastfeeding = formData.get('isBreastfeeding') === 'true';

    // Validate required fields
    if (!name || !email || !password || !address || !dateOfBirth) {
      return NextResponse.json({ 
        message: "Missing required fields: name, email, password, address, and date of birth are required." 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        message: "Invalid email format." 
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

    // Handle file uploads (simplified for now - store as JSON in existing fields)
    let photoIdUrl = null;
    let addressProofUrl = null;

    if (photoId && photoId.size > 0) {
      photoIdUrl = `uploads/photo-id-${Date.now()}-${photoId.name}`;
    }

    if (addressProof && addressProof.size > 0) {
      addressProofUrl = `uploads/address-proof-${Date.now()}-${addressProof.name}`;
    }

    // Create medical profile data as JSON
    const medicalProfileData = {
      dateOfBirth,
      currentMedications: currentMedications ? currentMedications.split(',').map(m => m.trim()) : [],
      allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
      medicalConditions: medicalConditions ? medicalConditions.split(',').map(c => c.trim()) : [],
      isPregnant,
      isBreastfeeding,
      ageVerified: age >= 16,
      identityVerified: false,
      accountStatus: "pending"
    };

    // Create user with identity verification data (using existing schema fields)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        address,
        nationalInsuranceNumber,
        nhsNumber,
        file1Url: photoIdUrl, // Photo ID
        file2Url: addressProofUrl, // Address proof
        roleId: 1, // Default customer role
      },
    });

    // Generate JWT token
    const token = generateToken({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: 'customer'
    });

    // Set cookie
    const response = NextResponse.json({
      message: "Registration successful! Your account is pending verification by our pharmacy team.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        medicalProfile: medicalProfileData,
      },
      requiresIdentityVerification: !photoIdUrl || !addressProofUrl,
      requiresPharmacistReview: currentMedications || allergies || medicalConditions || isPregnant || isBreastfeeding,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      message: "Registration failed. Please try again." 
    }, { status: 500 });
  }
}
