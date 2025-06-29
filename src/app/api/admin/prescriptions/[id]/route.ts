import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// PUT /api/admin/prescriptions/[id] - Update prescription status, approve, reject, etc.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(req);
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const prescriptionId = parseInt(params.id);
    if (isNaN(prescriptionId)) {
      return createErrorResponse("Invalid prescription ID", 400);
    }

    const { status, rejectedReason, trackingNumber } = await req.json();

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

    // Build update data (using only available fields for now)
    const updateData: any = {};

    if (status) {
      updateData.status = status;
      // Note: Additional fields like approvedBy, approvedAt will be added when schema is fully updated
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

// DELETE /api/admin/prescriptions/[id] - Delete prescription (if needed)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and admin role
    const user = await requireAuth(req);
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
