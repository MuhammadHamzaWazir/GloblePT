import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user's verification status
    const fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      select: {
        id: true,
        name: true,
        email: true,
        file1Url: true,
        file2Url: true,
        nationalInsuranceNumber: true,
        nhsNumber: true,
        address: true
      }
    });

    if (!fullUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Parse verification status from file2Url field
    let verificationStatus = 'pending';
    let verifiedBy = null;
    let verifiedAt = null;
    let verificationNotes = null;

    if (fullUser.file2Url?.includes('verified:')) {
      verificationStatus = 'verified';
      const parts = fullUser.file2Url.split('verified:')[1]?.split(':');
      if (parts && parts.length >= 2) {
        verifiedAt = new Date(parseInt(parts[0])).toISOString();
        // Get verifier name (parts[1] is verifier ID)
        try {
          const verifier = await prisma.user.findUnique({
            where: { id: parseInt(parts[1]) },
            select: { name: true }
          });
          verifiedBy = verifier?.name || 'Admin';
        } catch (error) {
          verifiedBy = 'Admin';
        }
      }
    } else if (fullUser.file2Url?.includes('rejected:')) {
      verificationStatus = 'rejected';
      const parts = fullUser.file2Url.split('rejected:')[1]?.split(':');
      if (parts && parts.length >= 2) {
        verifiedAt = new Date(parseInt(parts[0])).toISOString();
        try {
          const verifier = await prisma.user.findUnique({
            where: { id: parseInt(parts[1]) },
            select: { name: true }
          });
          verifiedBy = verifier?.name || 'Admin';
        } catch (error) {
          verifiedBy = 'Admin';
        }
      }
    }

    // Extract verification notes from address field
    if (fullUser.address?.includes('[Admin Notes:')) {
      const notesMatch = fullUser.address.match(/\[Admin Notes: (.+?)\]/);
      if (notesMatch) {
        verificationNotes = notesMatch[1];
      }
    }

    return NextResponse.json({
      verification: {
        status: verificationStatus,
        hasPhotoId: !!fullUser.file1Url && !fullUser.file1Url.startsWith('2fa:'),
        hasAddressProof: !!fullUser.file2Url && !fullUser.file2Url.includes('verified:') && !fullUser.file2Url.includes('rejected:'),
        hasNationalInsurance: !!fullUser.nationalInsuranceNumber,
        hasNHS: !!fullUser.nhsNumber,
        verifiedBy,
        verifiedAt,
        notes: verificationNotes,
        documentSubmitted: !!(fullUser.file1Url || fullUser.file2Url || fullUser.nationalInsuranceNumber || fullUser.nhsNumber)
      }
    });

  } catch (error) {
    console.error('Verification status check error:', error);
    return NextResponse.json({ 
      message: "Failed to check verification status" 
    }, { status: 500 });
  }
}
