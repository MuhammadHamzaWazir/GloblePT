import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// PUT - Update assigned complaint (staff can only update status and add notes)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const complaintId = parseInt(params.id);

    // Get auth token from cookie
    const cookieStore = request.cookies;
    const token = cookieStore.get('pharmacy_auth')?.value;

    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify JWT token and check role
    const decoded = verifyToken(token);
        
        if (!decoded) {
          return NextResponse.json({ 
            success: false, 
            message: 'Invalid authentication token' 
          }, { status: 401 });
        }
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id) }, // Fixed: changed from decoded.userId to decoded.id
      include: { role: true }
    });

    if (!user || !['staff', 'admin'].includes(user.role?.name || '')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Staff access required' 
      }, { status: 403 });
    }

    // Find staff record
    const staff = await prisma.staff.findUnique({
      where: { email: user.email }
    });

    if (!staff) {
      return NextResponse.json({ 
        success: false, 
        message: 'Staff record not found' 
      }, { status: 404 });
    }

    // Validate complaint exists and is assigned to this staff member
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!existingComplaint) {
      return NextResponse.json({ 
        success: false, 
        message: 'Complaint not found' 
      }, { status: 404 });
    }

    if (existingComplaint.assignedToId !== staff.id) {
      return NextResponse.json({ 
        success: false, 
        message: 'You can only update complaints assigned to you' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { status, resolution } = body;

    // Validate status
    const validStatuses = ['investigating', 'resolved'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Staff can only set status to investigating or resolved' 
      }, { status: 400 });
    }

    // Build update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // If resolving the complaint, resolution is required
      if (status === 'resolved') {
        if (!resolution) {
          return NextResponse.json({ 
            success: false, 
            message: 'Resolution is required when marking complaint as resolved' 
          }, { status: 400 });
        }
        updateData.resolution = resolution;
        updateData.resolvedAt = new Date();
        updateData.resolvedById = user.id;
      }
    }

    // Update complaint
    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true
          }
        },
        assignedBy: {
          select: {
            name: true,
            email: true
          }
        },
        resolvedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Complaint updated successfully',
      data: { complaint: updatedComplaint }
    });

  } catch (error) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update complaint' 
    }, { status: 500 });
  }
}
