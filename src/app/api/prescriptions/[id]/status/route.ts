import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  'pending': ['processing', 'approved', 'rejected'],
  'processing': ['approved', 'rejected', 'ready'],
  'approved': ['ready', 'dispatched'],
  'ready': ['dispatched'],
  'dispatched': ['delivered', 'completed'],
  'delivered': ['completed'],
  'rejected': [], // Final state
  'cancelled': [], // Final state
  'completed': [] // Final state
};

const VALID_STATUSES = [
  'pending', 'processing', 'approved', 'ready', 
  'dispatched', 'delivered', 'completed', 'rejected', 'cancelled'
];

// PUT /api/prescriptions/[id]/status - Update prescription status (Staff/Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 Prescription Status Update API - PUT request received');
    
    const prescriptionId = parseInt(params.id);
    
    if (isNaN(prescriptionId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid prescription ID' 
      }, { status: 400 });
    }

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

    // Verify JWT token
    const decoded = verifyToken(token);
        
        if (!decoded) {
          return NextResponse.json({ 
            success: false, 
            message: 'Invalid authentication token' 
          }, { status: 401 });
        }
    const userId = parseInt(decoded.id);
    const userRole = decoded.role;
    
    console.log('🔍 Decoded user ID:', userId, 'Role:', userRole);

    // Only staff and admins can update prescription status
    if (!['staff', 'admin'].includes(userRole?.toLowerCase())) {
      return NextResponse.json({ 
        success: false, 
        message: 'Only staff and admins can update prescription status' 
      }, { status: 403 });
    }

    // Parse request body
    const { status, notes, price, rejectionReason } = await request.json();
    
    console.log('🔍 Status update request:', { status, notes, price, rejectionReason });

    // Validate new status
    if (!status || !VALID_STATUSES.includes(status.toLowerCase())) {
      return NextResponse.json({ 
        success: false, 
        message: `Invalid status. Valid statuses are: ${VALID_STATUSES.join(', ')}` 
      }, { status: 400 });
    }

    // Get the current prescription
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { 
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!prescription) {
      return NextResponse.json({ 
        success: false, 
        message: 'Prescription not found' 
      }, { status: 404 });
    }

    const currentStatus = prescription.status.toLowerCase();
    const newStatus = status.toLowerCase();

    // Check if status transition is valid
    if (currentStatus !== newStatus && !STATUS_TRANSITIONS[currentStatus]?.includes(newStatus)) {
      return NextResponse.json({ 
        success: false, 
        message: `Invalid status transition from '${currentStatus}' to '${newStatus}'. Valid transitions: ${STATUS_TRANSITIONS[currentStatus]?.join(', ') || 'none'}` 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // Add staff/admin tracking
    if (newStatus === 'approved') {
      updateData.approvedBy = userId;
      updateData.approvedAt = new Date();
      
      // Update price if provided
      if (price && price > 0) {
        updateData.amount = parseFloat(price);
      }
    }

    // Add rejection reason if provided
    if (newStatus === 'rejected' && rejectionReason) {
      updateData.rejectedReason = rejectionReason;
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = notes;
    }

    // Update the prescription
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvedByUser: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    console.log('✅ Prescription status updated successfully:', updatedPrescription.id);

    return NextResponse.json({
      success: true,
      message: `Prescription status updated to '${newStatus}' successfully`,
      data: { 
        prescription: updatedPrescription,
        previousStatus: currentStatus,
        newStatus: newStatus
      }
    });

  } catch (error) {
    console.error('Prescription status update error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update prescription status. Please try again.' 
    }, { status: 500 });
  }
}

// GET /api/prescriptions/[id]/status - Get valid status transitions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = parseInt(params.id);
    
    if (isNaN(prescriptionId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid prescription ID' 
      }, { status: 400 });
    }

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
    const decoded = verifyToken(token);
        
        if (!decoded) {
          return NextResponse.json({ 
            success: false, 
            message: 'Invalid authentication token' 
          }, { status: 401 });
        }
    const userRole = decoded.role;

    // Only staff and admins can view status transitions
    if (!['staff', 'admin'].includes(userRole?.toLowerCase())) {
      return NextResponse.json({ 
        success: false, 
        message: 'Only staff and admins can view status transitions' 
      }, { status: 403 });
    }

    // Get the current prescription
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: {
        id: true,
        status: true
      }
    });

    if (!prescription) {
      return NextResponse.json({ 
        success: false, 
        message: 'Prescription not found' 
      }, { status: 404 });
    }

    const currentStatus = prescription.status.toLowerCase();
    const validTransitions = STATUS_TRANSITIONS[currentStatus] || [];

    return NextResponse.json({
      success: true,
      data: {
        currentStatus,
        validTransitions,
        allStatuses: VALID_STATUSES
      }
    });

  } catch (error) {
    console.error('Get status transitions error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to get status information. Please try again.' 
    }, { status: 500 });
  }
}
