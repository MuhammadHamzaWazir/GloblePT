import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// PUT /api/admin/prescriptions/[id] - Update prescription status, approve, reject, etc.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and admin role
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
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const prescriptionId = parseInt(params.id);
    if (isNaN(prescriptionId)) {
      return createErrorResponse("Invalid prescription ID", 400);
    }

    const { status, rejectedReason, trackingNumber, courierName, amount, staffId } = await req.json();

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'ready_to_ship', 'dispatched', 'delivered'];
    if (status && !validStatuses.includes(status)) {
      return createErrorResponse("Invalid status", 400);
    }

    // Check if prescription exists
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { user: true }
    });

    if (!existingPrescription) {
      return createErrorResponse("Prescription not found", 404);
    }

    // Build update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
      
      // If approving, record approval details
      if (status === 'approved') {
        updateData.approvedBy = parseInt(user.id);
        updateData.approvedAt = new Date();
      }
      
      // If rejecting, record rejection reason
      if (status === 'rejected' && rejectedReason) {
        updateData.rejectedReason = rejectedReason;
      }
    }

    // Admin can update price/amount
    if (amount !== undefined) {
      if (amount < 0) {
        return createErrorResponse("Amount must be a positive number", 400);
      }
      updateData.amount = parseFloat(amount.toString());
    }

    // Admin can assign to staff
    if (staffId !== undefined) {
      if (staffId) {
        // Verify staff exists
        const staffRecord = await prisma.staff.findUnique({
          where: { id: parseInt(staffId) }
        });
        if (!staffRecord) {
          return createErrorResponse("Staff member not found", 404);
        }
        updateData.staffId = parseInt(staffId);
      } else {
        updateData.staffId = null;
      }
    }

    // Admin can update tracking number and courier name
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    if (courierName) {
      updateData.courierName = courierName;
    }

    // Update prescription
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
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
        order: true
      }
    });

    // If marking as dispatched, also update the corresponding order
    if (status === 'dispatched' && updatedPrescription.order) {
      const orderUpdateData: any = {
        status: 'dispatched',
        dispatchedAt: new Date()
      };
      
      if (trackingNumber) {
        orderUpdateData.trackingNumber = trackingNumber;
      }
      
      if (courierName) {
        orderUpdateData.courierName = courierName;
      }
      
      await prisma.order.update({
        where: { id: updatedPrescription.order.id },
        data: orderUpdateData
      });
    }

    return createSuccessResponse({
      prescription: updatedPrescription,
      message: `Prescription ${status ? `status updated to ${status}` : 'updated'} successfully`
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/admin/prescriptions/[id] - Delete prescription (if needed)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and admin role
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
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const prescriptionId = parseInt(params.id);
    if (isNaN(prescriptionId)) {
      return createErrorResponse("Invalid prescription ID", 400);
    }

    // Check if prescription exists
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId }
    });

    if (!existingPrescription) {
      return createErrorResponse("Prescription not found", 404);
    }

    // Only allow deletion of pending or rejected prescriptions
    if (!['pending', 'rejected'].includes(existingPrescription.status)) {
      return createErrorResponse("Cannot delete prescription with current status", 400);
    }

    await prisma.prescription.delete({
      where: { id: prescriptionId }
    });

    return createSuccessResponse({
      message: "Prescription deleted successfully"
    });

  } catch (error) {
    return handleApiError(error);
  }
}
