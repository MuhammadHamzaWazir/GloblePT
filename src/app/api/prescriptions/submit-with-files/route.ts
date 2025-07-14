import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Prescription Submit with Files API - POST request received');
    
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
    
    console.log('🔍 Decoded user ID:', userId);

    // Parse JSON data
    const prescriptionData = await request.json();
    console.log('🔍 Prescription data received:', prescriptionData);
    
    const { 
      medicines,
      prescriptionText,
      medicine,
      quantity,
      deliveryAddress,
      fileUrls,
      filename
    } = prescriptionData;

    // Validate required fields
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0 || !deliveryAddress) {
      return NextResponse.json({ 
        success: false, 
        message: 'At least one medicine and delivery address are required' 
      }, { status: 400 });
    }

    // Validate that at least one medicine has a name
    const hasValidMedicine = medicines.some((med: any) => med.name && med.name.trim());
    if (!hasValidMedicine) {
      return NextResponse.json({ 
        success: false, 
        message: 'At least one medicine must have a name' 
      }, { status: 400 });
    }

    // Validate that file URLs are provided (files were uploaded separately)
    if (!fileUrls || !Array.isArray(fileUrls) || fileUrls.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'At least one prescription file URL is required' 
      }, { status: 400 });
    }

    console.log('🔍 File URLs received:', fileUrls);

    // Calculate total quantity and prepare medicines data
    const totalQuantity = medicines.reduce((sum: number, med: any) => sum + (parseInt(med.quantity) || 1), 0);
    const firstMedicine = medicines.find((med: any) => med.name && med.name.trim());

    // Create prescription entry
    const prescriptionEntryData: any = {
      userId,
      medicine: firstMedicine.name.trim(), // Legacy field - use first medicine
      medicines: JSON.stringify(medicines), // Store all medicines as JSON
      quantity: totalQuantity,
      deliveryAddress: deliveryAddress.trim(),
      status: 'pending', // Default status - will transition to 'processing' -> 'approved'
      paymentStatus: 'unpaid',
      medicineType: 'POM', // Assume prescription only medicine
      requiresPrescription: true,
      pharmacistApprovalRequired: true,
      fileUrls: JSON.stringify(fileUrls),
      filename: filename || 'Prescription Document'
    };

    // Add optional fields if provided
    if (firstMedicine.dosage) prescriptionEntryData.dosage = firstMedicine.dosage.trim();
    if (prescriptionText) prescriptionEntryData.prescriptionText = prescriptionText.trim();
    
    // Build comprehensive instructions including all medicines
    let combinedInstructions = '';
    
    // Add instructions from each medicine
    medicines.forEach((med: any, index: number) => {
      if (med.instructions && med.instructions.trim()) {
        combinedInstructions += (combinedInstructions ? ' | ' : '') + `Medicine ${index + 1} (${med.name}): ${med.instructions.trim()}`;
      }
    });
    
    if (combinedInstructions) {
      prescriptionEntryData.instructions = combinedInstructions;
    }

    console.log('🔍 Creating prescription with data:', prescriptionEntryData);

    const prescription = await prisma.prescription.create({
      data: prescriptionEntryData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ Prescription created with ID:', prescription.id);

    return NextResponse.json({
      success: true,
      message: `Prescription submitted successfully with ${fileUrls.length} file(s)! Our pharmacists will review it shortly.`,
      data: { 
        prescription,
        fileCount: fileUrls.length,
        fileUrls 
      }
    });

  } catch (error) {
    console.error('Prescription submission with files error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to submit prescription. Please try again.' 
    }, { status: 500 });
  }
}
