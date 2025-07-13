import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userDetails = await prisma.user.findUnique({
      where: { id: parseInt(user.id.toString()) },
      select: {
        gpName: true,
        gpAddress: true,
        gpPhone: true,
        gpEmail: true,
        practiceName: true,
        nhsNumber: true
      }
    });

    return NextResponse.json({
      gpDetails: userDetails || {}
    });

  } catch (error) {
    console.error('Fetch GP details error:', error);
    return NextResponse.json({ 
      message: "Failed to fetch GP details" 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('=== GP Details API Debug ===');
    
    const user = await requireAuth(req);
    console.log('Authenticated user:', user);
    
    if (!user) {
      console.log('Authentication failed - no user');
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body);
    
    const { gpName, gpAddress, gpPhone, gpEmail, practiceName, nhsNumber } = body;

    // Validate required fields
    if (!gpName || !gpAddress || !gpPhone || !practiceName || !nhsNumber) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json({ 
        message: "GP name, address, phone, practice name, and NHS number are required" 
      }, { status: 400 });
    }

    // Validate NHS number format
    const cleanNhsNumber = nhsNumber.replace(/\s/g, '');
    if (!/^\d{10}$/.test(cleanNhsNumber)) {
      console.log('NHS number validation failed:', nhsNumber, 'clean:', cleanNhsNumber);
      return NextResponse.json({ 
        message: "Please enter a valid 10-digit NHS number" 
      }, { status: 400 });
    }

    console.log('Updating user ID:', user.id, 'with GP details');

    // Update user GP details
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(user.id.toString()) },
      data: {
        gpName,
        gpAddress,
        gpPhone,
        gpEmail: gpEmail || null,
        practiceName,
        nhsNumber: cleanNhsNumber
      }
    });

    console.log('Update successful for user:', updatedUser.id);

    return NextResponse.json({
      message: "GP details updated successfully"
    });

  } catch (error) {
    console.error('Update GP details error:', error);
    return NextResponse.json({ 
      message: "Failed to update GP details" 
    }, { status: 500 });
  }
}
