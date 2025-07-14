import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Prescription Submit API - POST request received');
    
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
      console.log('❌ Invalid authentication token');
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid authentication token' 
      }, { status: 401 });
    }
    const userId = parseInt(decoded.id);
    
    console.log('🔍 Decoded user ID:', userId);

    // Parse JSON data
    const formData = await request.json();
    console.log('🔍 Form data received:', formData);
    
    const { 
      medicines,
      doctorName, 
      doctorContact, 
      deliveryAddress, 
      urgency, 
      notes 
    } = formData;

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

    // Calculate total quantity and prepare medicines data
    const totalQuantity = medicines.reduce((sum: number, med: any) => sum + (parseInt(med.quantity) || 1), 0);
    const firstMedicine = medicines.find((med: any) => med.name && med.name.trim());
    
    // Create prescription entry
    const prescriptionData: any = {
      userId,
      medicine: firstMedicine.name.trim(), // Legacy field - use first medicine
      medicines: JSON.stringify(medicines), // Store all medicines as JSON
      quantity: totalQuantity,
      amount: 0.0, // Will be set after pharmacist review - ensure it's a proper float
      deliveryAddress: deliveryAddress.trim(),
      status: 'pending', // Default status - will transition to 'processing' -> 'approved'
      paymentStatus: 'unpaid',
      medicineType: 'POM', // Assume prescription only medicine
      requiresPrescription: true,
      pharmacistApprovalRequired: true
    };

    // Add optional fields if provided
    if (firstMedicine.dosage) prescriptionData.dosage = firstMedicine.dosage.trim();
    if (doctorName) prescriptionData.prescribedBy = doctorName.trim();
    
    // Build comprehensive instructions including all medicines and form details
    let combinedInstructions = '';
    
    // Add instructions from each medicine
    medicines.forEach((med: any, index: number) => {
      if (med.instructions && med.instructions.trim()) {
        combinedInstructions += (combinedInstructions ? ' | ' : '') + `Medicine ${index + 1} (${med.name}): ${med.instructions.trim()}`;
      }
    });
    
    if (doctorContact) {
      combinedInstructions += (combinedInstructions ? ' | ' : '') + `Doctor Contact: ${doctorContact.trim()}`;
    }
    if (urgency && urgency !== 'normal') {
      combinedInstructions += (combinedInstructions ? ' | ' : '') + `Urgency: ${urgency}`;
    }
    if (notes) {
      combinedInstructions += (combinedInstructions ? ' | ' : '') + `Notes: ${notes.trim()}`;
    }
    
    if (combinedInstructions) {
      prescriptionData.instructions = combinedInstructions;
    }

    // Build prescription text with all medicines and form details for comprehensive record
    let prescriptionText = 'Prescription Request: ';
    medicines.forEach((med: any, index: number) => {
      if (med.name && med.name.trim()) {
        if (index > 0) prescriptionText += ' | ';
        prescriptionText += `${med.name} (Qty: ${med.quantity || 1}`;
        if (med.dosage) prescriptionText += `, Dosage: ${med.dosage}`;
        if (med.instructions) prescriptionText += `, Instructions: ${med.instructions}`;
        prescriptionText += ')';
      }
    });
    
    if (doctorName) prescriptionText += ` - Doctor: ${doctorName}`;
    if (doctorContact) prescriptionText += ` - Doctor Contact: ${doctorContact}`;
    if (urgency && urgency !== 'normal') prescriptionText += ` - Urgency: ${urgency}`;
    if (notes) prescriptionText += ` - Notes: ${notes}`;

    prescriptionData.prescriptionText = prescriptionText;

    console.log('🔍 Creating prescription with data:', prescriptionData);

    const prescription = await prisma.prescription.create({
      data: prescriptionData,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Prescription submitted successfully! Our pharmacists will review it shortly.',
      data: { prescription }
    });

  } catch (error) {
    console.error('❌ Prescription submission error:', error);
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // More specific error message based on error type
    let errorMessage = 'Failed to submit prescription. Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        errorMessage = 'A prescription with this information already exists.';
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Invalid user or staff reference.';
      } else if (error.message.includes('required')) {
        errorMessage = 'Missing required prescription information.';
      }
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }, { status: 500 });
  }
}
