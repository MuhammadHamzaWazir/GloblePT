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

    const { medicine, dosage, instructions, quantity, prescriptionText, deliveryAddress, medicines } = await req.json();

    // Validate required fields
    if (!prescriptionText || !deliveryAddress) {
      return createErrorResponse("Prescription details and delivery address are required", 400);
    }

    // Use medicines array if provided, otherwise fall back to single medicine
    let primaryMedicine = medicine;
    let totalQuantity = quantity || 1;
    let medicineDetails = prescriptionText;

    if (medicines && medicines.length > 0) {
      const validMedicines = medicines.filter((med: any) => med.name && med.name.trim() !== '');
      if (validMedicines.length > 0) {
        primaryMedicine = validMedicines[0].name;
        totalQuantity = validMedicines.reduce((total: number, med: any) => total + (med.quantity || 1), 0);
        
        // Create detailed medicine list in prescription text
        const medicineList = validMedicines.map((med: any) => 
          `${med.name} - Qty: ${med.quantity || 1}${med.dosage ? `, Dosage: ${med.dosage}` : ''}${med.instructions ? `, Instructions: ${med.instructions}` : ''}`
        ).join('\n');
        
        medicineDetails = `${prescriptionText}\n\nRequested Medicines:\n${medicineList}`;
      }
    }

    if (!primaryMedicine) {
      return createErrorResponse("At least one medicine is required", 400);
    }

    // For now, set a default amount - in real app this would be calculated
    const estimatedAmount = 15.00; // Default amount

    const newPrescription = await prisma.prescription.create({
      data: {
        userId: parseInt(user.id),
        medicine: primaryMedicine,
        dosage: dosage || '',
        instructions: instructions || '',
        quantity: totalQuantity,
        prescriptionText: medicineDetails,
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
