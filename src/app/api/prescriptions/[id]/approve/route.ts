import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// PUT /api/prescriptions/[id]/approve - Approve prescription (Admin/Supervisor only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = parseInt(params.id);
    
    if (isNaN(prescriptionId)) {
      return createErrorResponse("Invalid prescription ID", 400);
    }

    // Check authentication and authorization
    const user = await requireAuth(req);
    if (!user) {
      return createErrorResponse("Unauthorized access", 401);
    }

    // Only supervisors and admins can approve prescriptions
    if (!['supervisor', 'admin'].includes(user.role?.toLowerCase())) {
      return createErrorResponse("Only supervisors and admins can approve prescriptions", 403);
    }

    const { action, price, rejectionReason, notes } = await req.json();

    // Validate action
    if (!['approve', 'reject'].includes(action)) {
      return createErrorResponse("Action must be either 'approve' or 'reject'", 400);
    }

    // Get the prescription
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
      return createErrorResponse("Prescription not found", 404);
    }

    // Check if prescription is in pending status
    if (prescription.status !== 'pending') {
      return createErrorResponse(`Prescription cannot be ${action}ed. Current status: ${prescription.status}`, 400);
    }

    // Prepare update data
    const updateData: any = {
      approvedBy: parseInt(user.id),
      approvedAt: new Date(),
    };

    if (action === 'approve') {
      updateData.status = 'approved';
      
      // If price is provided, update it (staff/admin pricing)
      if (price && price > 0) {
        updateData.amount = parseFloat(price);
      }
    } else {
      updateData.status = 'rejected';
      if (rejectionReason) {
        updateData.rejectedReason = rejectionReason;
      }
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
            email: true
          }
        }
      }
    });

    return createSuccessResponse({
      prescription: updatedPrescription,
      message: `Prescription ${action}ed successfully`,
      actionBy: user.name,
      actionAt: new Date()
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/prescriptions/[id]/approve - Get prescription details for approval
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = parseInt(params.id);
    
    if (isNaN(prescriptionId)) {
      return createErrorResponse("Invalid prescription ID", 400);
    }

    // Check authentication and authorization
    const user = await requireAuth(req);
    if (!user) {
      return createErrorResponse("Unauthorized access", 401);
    }

    // Only supervisors and admins can view prescription approval details
    if (!['supervisor', 'admin'].includes(user.role?.toLowerCase())) {
      return createErrorResponse("Only supervisors and admins can view prescription approval details", 403);
    }

    // Get the prescription with all related data
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true,
            file1Url: true,
            file2Url: true,
            medicalProfile: {
              select: {
                currentMedications: true,
                allergies: true,
                medicalConditions: true,
                isPregnant: true,
                isBreastfeeding: true,
                understandsRisks: true,
                canFollowInstructions: true,
                hasDecisionCapacity: true
              }
            }
          }
        },
        staff: {
          select: {
            name: true,
            email: true
          }
        },
        approvedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!prescription) {
      return createErrorResponse("Prescription not found", 404);
    }

    return createSuccessResponse({
      prescription,
      canApprove: prescription.status === 'pending',
      userVerificationStatus: {
        hasPhotoId: !!(prescription as any).user?.file1Url,
        hasAddressProof: !!(prescription as any).user?.file2Url,
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}
