import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// GET /api/prescriptions - Get user's prescriptions
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(req);
    if (!user) {
      return createErrorResponse("Unauthorized access", 401);
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { userId: parseInt(user.id) },
      orderBy: { createdAt: 'desc' }
    });

    return createSuccessResponse({ prescriptions });

  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/prescriptions - Create new prescription request
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(req);
    if (!user) {
      return createErrorResponse("Unauthorized access", 401);
    }

    const { medicine, dosage, instructions, quantity, prescriptionText, deliveryAddress } = await req.json();

    // Validate required fields
    if (!medicine || !prescriptionText || !deliveryAddress) {
      return createErrorResponse("Medicine, prescription details, and delivery address are required", 400);
    }

    // For now, set a default amount - in real app this would be calculated
    const estimatedAmount = 15.00; // Default amount

    const newPrescription = await prisma.prescription.create({
      data: {
        userId: parseInt(user.id),
        medicine,
        dosage: dosage || '',
        instructions: instructions || '',
        quantity: quantity || 1,
        prescriptionText,
        amount: estimatedAmount,
        deliveryAddress,
        status: 'pending',
        paymentStatus: 'unpaid'
      }
    });

    return NextResponse.json({
      success: true,
      data: { prescription: newPrescription },
      message: "Prescription request submitted successfully"
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
