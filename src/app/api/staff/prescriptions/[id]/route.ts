import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// PUT /api/staff/prescriptions/[id] - Update prescription (staff can update certain fields)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and staff role
    const user = await requireAuth(req);
    if (!user || !['STAFF', 'ADMIN'].includes(user.role.toUpperCase())) {
      return createErrorResponse("Unauthorized access", 403);
    }

    const prescriptionId = parseInt(params.id);
    if (isNaN(prescriptionId)) {
      return createErrorResponse("Invalid prescription ID", 400);
    }

    const { status, trackingNumber, notes } = await req.json();

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
