import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// PUT - Update complaint (assign staff, change status, add resolution)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 Admin complaint update API - PUT request received');
    const { id } = await params;
    const complaintId = parseInt(id);
    console.log('🔍 Complaint ID:', complaintId);

    // Get auth token from cookie
    const cookieStore = request.cookies;
    const token = cookieStore.get('pharmacy_auth')?.value;

    console.log('🔍 Token found:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('❌ No authentication token found');
      return NextResponse.json({ 
        success: false, 
        message: 'Authentication required' 
      }, { status: 401 });
    }

    // Verify JWT token and check role
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    console.log('🔍 Decoded token:', { id: decoded.id, email: decoded.email, role: decoded.role });
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.id || decoded.userId) }
    });

    console.log('🔍 User found:', user ? `${user.name} (${user.role})` : 'No user found');

    if (!user || user.role !== 'admin') {
      console.log('❌ Admin access required');
      return NextResponse.json({ 
        success: false, 
        message: 'Admin access required' 
      }, { status: 403 });
    }

    const body = await request.json();
    console.log('🔍 Request body:', body);
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
        console.log('🔍 Assigning complaint to staff ID:', assignedToId);
        // Validate staff exists (staff or assistant user)
        const staff = await prisma.user.findFirst({
          where: { 
            id: assignedToId,
            OR: [
              { role: 'staff' },
              { role: 'assistant' }
            ]
          }
        });

        console.log('🔍 Staff member found:', staff ? `${staff.name} (${staff.role})` : 'Not found');

        if (!staff) {
          console.log('❌ Staff member not found for ID:', assignedToId);
          return NextResponse.json({ 
            success: false, 
            message: 'Staff member not found' 
          }, { status: 400 });
        }

        updateData.assignedToId = assignedToId;
        updateData.assignedAt = new Date();
        updateData.assignedById = user.id;
        
        console.log('🔍 Assignment data set:', { assignedToId, assignedById: user.id });
        
        // Auto-change status to investigating if assigning
        if (!status) {
          updateData.status = 'investigating';
        }
      }
    }

    console.log('🔍 Update data:', updateData);

    try {
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
              email: true,
              role: true
            }
          },
          assignedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          resolvedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      console.log('✅ Complaint updated successfully');

      return NextResponse.json({
        success: true,
        message: 'Complaint updated successfully',
        data: { complaint: updatedComplaint }
      });
    } catch (updateError: any) {
      console.error('❌ Prisma update error:', updateError);
      return NextResponse.json({ 
        success: false, 
        message: `Update failed: ${updateError.message}` 
      }, { status: 500 });
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaintId = parseInt(id);

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
      where: { id: parseInt(decoded.id || decoded.userId) }
    });

    if (!user || !['admin', 'staff', 'assistant'].includes(user.role || '')) {
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
