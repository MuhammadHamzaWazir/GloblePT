import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// PUT - Update complaint (assign staff, change status, add resolution)
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user || user.role?.name !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: 'Admin access required' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { status, assignedToId, resolution, priority } = body;

    // Validate complaint exists
    const existingComplaint = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

    if (!existingComplaint) {
      return NextResponse.json({ 
        success: false, 
        message: 'Complaint not found' 
      }, { status: 404 });
    }

    // Validate status
    const validStatuses = ['received', 'investigating', 'resolved', 'closed'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid status' 
      }, { status: 400 });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid priority' 
      }, { status: 400 });
    }

    // Build update data
    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      // If resolving the complaint
      if (status === 'resolved' && resolution) {
        updateData.resolution = resolution;
        updateData.resolvedAt = new Date();
        updateData.resolvedById = user.id;
      }
    }

    if (priority) {
      updateData.priority = priority;
    }

    // Handle staff assignment
    if (assignedToId !== undefined) {
      if (assignedToId === null) {
        // Unassigning
        updateData.assignedToId = null;
        updateData.assignedAt = null;
        updateData.assignedById = null;
      } else {
        // Validate staff exists
        const staff = await prisma.staff.findUnique({
          where: { id: assignedToId }
        });

        if (!staff) {
          return NextResponse.json({ 
            success: false, 
            message: 'Staff member not found' 
          }, { status: 400 });
        }

        updateData.assignedToId = assignedToId;
        updateData.assignedAt = new Date();
        updateData.assignedById = user.id;
        
        // Auto-change status to investigating if assigning
        if (!status) {
          updateData.status = 'investigating';
        }
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
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
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

// GET - Get single complaint details
export async function GET(
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

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true }
    });

    if (!user || !['admin', 'staff'].includes(user.role?.name || '')) {
      return NextResponse.json({ 
        success: false, 
        message: 'Access denied' 
      }, { status: 403 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
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

    if (!complaint) {
      return NextResponse.json({ 
        success: false, 
        message: 'Complaint not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { complaint }
    });

  } catch (error) {
    console.error('Error fetching complaint:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch complaint' 
    }, { status: 500 });
  }
}
