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
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            estimatedDelivery: true,
            trackingNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return createSuccessResponse({ prescriptions });

  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/prescriptions - Create new prescription request with capacity assessment
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const user = await requireAuth(req);
    if (!user) {
      return createErrorResponse("Unauthorized access", 401);
    }

    const { 
      medicine, 
      dosage, 
      instructions, 
      quantity, 
      prescriptionText, 
      deliveryAddress, 
      medicines,
      // New fields for capacity assessment and medicine classification
      medicineType,
      requiresPrescription,
      ageRestricted,
      minimumAge,
      prescribedBy,
      prescriberGMC,
      // Capacity assessment
      understandsRisks,
      canFollowInstructions,
      hasReadWarnings,
      confirmsNoAllergies,
      // Age verification for restricted items
      confirmAgeRequirement
    } = await req.json();

    // Validate required fields
    if (!prescriptionText || !deliveryAddress) {
      return createErrorResponse("Prescription details and delivery address are required", 400);
    }

    // Get user's full details for verification
    const fullUser = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      select: {
        id: true,
        name: true,
        email: true,
        nationalInsuranceNumber: true,
        nhsNumber: true,
        file1Url: true,
        file2Url: true,
      }
    });

    if (!fullUser) {
      return createErrorResponse("User not found", 404);
    }

    // Age verification for restricted medicines
    if (ageRestricted && minimumAge) {
      if (!confirmAgeRequirement) {
        return createErrorResponse(`Age verification required. You must confirm you are at least ${minimumAge} years old to purchase this medicine.`, 400);
      }
    }

    // Identity verification check for certain medicines
    const requiresIdentityVerification = medicineType === 'POM' || (ageRestricted && minimumAge >= 18);
    if (requiresIdentityVerification && !fullUser.file1Url) {
      return createErrorResponse("Identity verification required for this medicine. Please upload a valid photo ID in your profile.", 400);
    }

    // Prescription validation for POM medicines
    if (medicineType === 'POM' && requiresPrescription) {
      if (!prescribedBy || !prescriberGMC) {
        return createErrorResponse("Prescription Only Medicine (POM) requires valid prescriber details and GMC number.", 400);
      }
    }

    // Capacity assessment for P medicines
    if (medicineType === 'P') {
      if (!understandsRisks || !canFollowInstructions || !hasReadWarnings) {
        return createErrorResponse("Capacity assessment incomplete. You must confirm understanding of risks, ability to follow instructions, and that you have read warnings.", 400);
      }
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

    // Calculate estimated amount based on medicine type and quantity
    let estimatedAmount = 15.00; // Default
    if (medicineType === 'POM') {
      estimatedAmount = 25.00; // Higher for prescription medicines
    } else if (ageRestricted) {
      estimatedAmount = 20.00; // Age-restricted medicines
    }
    
    estimatedAmount *= Math.max(1, totalQuantity * 0.8); // Quantity scaling

    // Set appropriate approval requirements
    const needsPharmacistApproval = medicineType === 'POM' || medicineType === 'P' || ageRestricted;
    const needsCapacityAssessment = medicineType === 'P' && (!understandsRisks || !canFollowInstructions);

    const newPrescription = await prisma.prescription.create({
      data: {
        userId: parseInt(user.id),
        medicine: primaryMedicine,
        dosage: dosage || '',
        instructions: instructions || '',
        quantity: totalQuantity,
        prescriptionText: medicineDetails,
        amount: 0, // No price until staff/admin sets it
        deliveryAddress,
        status: 'pending', // Always start as pending for approval
        paymentStatus: 'unpaid',
        // Store additional data in existing fields for now
        // In future schema, these would be proper fields:
        // medicineType,
        // requiresPrescription,
        // ageRestricted,
        // minimumAge,
        // prescribedBy,
        // prescriberGMC,
        // capacityConfirmed: !needsCapacityAssessment,
        // riskAssessmentComplete: understandsRisks,
        // pharmacistApprovalRequired: needsPharmacistApproval,
      }
    });

    // Determine next steps for the user
    let nextSteps = [];
    if (needsPharmacistApproval) {
      nextSteps.push("Your prescription requires pharmacist approval");
    }
    if (requiresIdentityVerification && !fullUser.file1Url) {
      nextSteps.push("Upload photo ID for identity verification");
    }
    if (needsCapacityAssessment) {
      nextSteps.push("Complete capacity assessment with pharmacist");
    }

    return NextResponse.json({
      success: true,
      data: { prescription: newPrescription },
      message: "Prescription request submitted successfully",
      nextSteps: nextSteps.length > 0 ? nextSteps : ["Your prescription is ready for payment"],
      requiresPharmacistReview: needsPharmacistApproval,
      identityVerificationRequired: requiresIdentityVerification && !fullUser.file1Url,
    }, { status: 201 });

  } catch (error) {
    return handleApiError(error);
  }
}
