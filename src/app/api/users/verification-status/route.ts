import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Get user's verification status
    const fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      select: {
        id: true,
        name: true,
        email: true,
        photoIdUrl: true,
        addressProofUrl: true,
        identityVerified: true,
        ageVerified: true,
        address: true
      }
    });

    if (!fullUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Determine verification status based on current schema
    let verificationStatus = 'pending';
    let verifiedBy = null;
    let verifiedAt = null;
    let verificationNotes = null;

    if (fullUser.identityVerified) {
      verificationStatus = 'verified';
      // Could add verifiedAt logic if needed
    }

    // Extract verification notes from address field if they exist
    if (fullUser.address?.includes('[Admin Notes:')) {
      const notesMatch = fullUser.address.match(/\[Admin Notes: (.+?)\]/);
      if (notesMatch) {
        verificationNotes = notesMatch[1];
      }
    }

    return NextResponse.json({
      verification: {
        status: verificationStatus,
        hasPhotoId: !!fullUser.photoIdUrl,
        hasAddressProof: !!fullUser.addressProofUrl,
        identityVerified: fullUser.identityVerified,
        ageVerified: fullUser.ageVerified,
        verifiedBy,
        verifiedAt,
        notes: verificationNotes,
        documentSubmitted: !!(fullUser.photoIdUrl || fullUser.addressProofUrl)
      }
    });

  } catch (error) {
    console.error('Verification status check error:', error);
    return NextResponse.json({ 
      message: "Failed to check verification status" 
    }, { status: 500 });
  }
}
