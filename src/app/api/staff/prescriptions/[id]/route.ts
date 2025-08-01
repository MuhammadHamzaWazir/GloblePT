import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// PUT /api/staff/prescriptions/[id] - Update prescription (staff can update certain fields)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and staff role
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
    if (!user || !['STAFF', 'ADMIN'].includes(user.role.toUpperCase())) {
      return createErrorResponse("Unauthorized access", 403);
    }

    const prescriptionId = parseInt(params.id);
    if (isNaN(prescriptionId)) {
      return createErrorResponse("Invalid prescription ID", 400);
    }

    const { status, trackingNumber, notes, amount } = await req.json();

    // Check if prescription exists
    const existingPrescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { user: true, staff: true }
    });

    if (!existingPrescription) {
      return createErrorResponse("Prescription not found", 404);
    }

    // Staff can only update prescriptions assigned to them (unless admin)
    if (user.role.toUpperCase() === 'STAFF') {
      // Find the staff record for this user
      const staffRecord = await prisma.staff.findUnique({
        where: { email: user.email }
      });
      
      if (!staffRecord || existingPrescription.staffId !== staffRecord.id) {
        return createErrorResponse("Can only update prescriptions assigned to you", 403);
      }
    }

    // Staff can update certain statuses
    const staffAllowedStatuses = ['ready_to_ship', 'dispatched', 'delivered'];
    if (status && !staffAllowedStatuses.includes(status)) {
      return createErrorResponse("Staff can only update to: ready_to_ship, dispatched, or delivered", 400);
    }

    // Build update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    // Staff can add notes or tracking information
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    // Staff can update price/amount for approved prescriptions
    if (amount !== undefined) {
      if (amount < 0) {
        return createErrorResponse("Amount must be a positive number", 400);
      }
      
      // Only allow price updates for approved prescriptions
      if (existingPrescription.status !== 'approved') {
        return createErrorResponse("Can only update price for approved prescriptions", 400);
      }
      
      updateData.amount = parseFloat(amount.toString());
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
        staff: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return createSuccessResponse({
      prescription: updatedPrescription,
      message: `Prescription ${status ? `status updated to ${status}` : 'updated'} successfully`
    });

  } catch (error) {
    return handleApiError(error);
  }
}
