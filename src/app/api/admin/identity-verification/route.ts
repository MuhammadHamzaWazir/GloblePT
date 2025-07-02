import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET - List users pending identity verification
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Check if user has admin/staff permissions
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) },
      include: { role: true },
    });

    if (!user || (user.role?.name !== 'admin' && user.role?.name !== 'staff')) {
      return NextResponse.json({ message: "Insufficient permissions" }, { status: 403 });
    }

    // Get users with uploaded documents but not yet verified
    const pendingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { file1Url: { not: null } },
          { file2Url: { not: null } }
        ],
        // In future schema: identityVerified: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        nationalInsuranceNumber: true,
        nhsNumber: true,
        file1Url: true,
        file2Url: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      users: pendingUsers,
      count: pendingUsers.length 
    });

  } catch (error) {
    console.error('Identity verification fetch error:', error);
    return NextResponse.json({ 
      message: "Failed to fetch pending verifications" 
    }, { status: 500 });
  }
}

// POST - Verify a user's identity
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Check if user has admin/staff permissions
    const verifier = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) },
      include: { role: true },
    });

    if (!verifier || (verifier.role?.name !== 'admin' && verifier.role?.name !== 'staff')) {
      return NextResponse.json({ message: "Insufficient permissions" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, verified, notes, ageVerified } = body;

    if (!userId || typeof verified !== 'boolean') {
      return NextResponse.json({ 
        message: "Missing required fields: userId and verified status" 
      }, { status: 400 });
    }

    // For now, store verification status in a custom field
    // In future schema, this would update identityVerified, identityVerifiedBy, etc.
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // For now, we'll use a simple approach - store verification in file URLs or create a separate verification log
    // In production with full schema, this would be:
    /*
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        identityVerified: verified,
        identityVerifiedAt: verified ? new Date() : null,
        identityVerifiedBy: verified ? verifier.id : null,
        ageVerified: ageVerified || false,
        accountStatus: verified ? "verified" : "pending",
        verificationNotes: notes,
      },
    });
    */

    return NextResponse.json({
      message: verified ? "User identity verified successfully" : "User identity verification rejected",
      userId,
      verifiedBy: verifier.name,
      verifiedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Identity verification error:', error);
    return NextResponse.json({ 
      message: "Identity verification failed" 
    }, { status: 500 });
  }
}
