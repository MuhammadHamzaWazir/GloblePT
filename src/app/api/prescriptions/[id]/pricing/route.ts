import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";

// PUT /api/prescriptions/[id]/pricing - Update prescription pricing (Staff/Admin only)
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
    if (!user) {
      return createErrorResponse("Unauthorized access", 401);
    }

    // Only staff and admins can update pricing
    if (!['staff', 'admin'].includes(user.role?.toLowerCase())) {
      return createErrorResponse("Only staff and admins can update prescription pricing", 403);
    }

    const { price, notes } = await req.json();

    // Validate price
    if (!price || price <= 0) {
      return createErrorResponse("Valid price is required", 400);
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

    // Only allow pricing updates on pending or approved prescriptions
    if (!['pending', 'approved'].includes(prescription.status)) {
      return createErrorResponse(`Prescription pricing cannot be updated. Current status: ${prescription.status}`, 400);
    }

    // Update the prescription pricing
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        amount: parseFloat(price),
        // Add notes if provided (store in existing field for now)
        instructions: notes ? `${prescription.instructions || ''}\n\nPricing Notes: ${notes}`.trim() : prescription.instructions,
        updatedAt: new Date()
      },
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

    return createSuccessResponse({
      prescription: updatedPrescription,
      message: "Prescription pricing updated successfully",
      updatedBy: user.name,
      updatedAt: new Date()
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// GET /api/prescriptions/[id]/pricing - Get prescription pricing details
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
    if (!user) {
      return createErrorResponse("Unauthorized access", 401);
    }

    // Only staff and admins can view pricing details
    if (!['staff', 'admin'].includes(user.role?.toLowerCase())) {
      return createErrorResponse("Only staff and admins can view prescription pricing details", 403);
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

    return createSuccessResponse({
      prescription: {
        id: prescription.id,
        medicine: prescription.medicine,
        quantity: prescription.quantity,
        currentPrice: prescription.amount,
        status: prescription.status,
        user: prescription.user,
        createdAt: prescription.createdAt,
        updatedAt: prescription.updatedAt
      },
      canUpdatePricing: ['pending', 'approved'].includes(prescription.status)
    });

  } catch (error) {
    return handleApiError(error);
  }
}
