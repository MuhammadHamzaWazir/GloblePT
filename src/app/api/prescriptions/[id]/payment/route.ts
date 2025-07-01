import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const prescriptionId = parseInt(params.id);
    
    if (isNaN(prescriptionId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid prescription ID' },
        { status: 400 }
      );
    }

    // Get the prescription
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { user: true }
    });

    if (!prescription) {
      return NextResponse.json(
        { success: false, message: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Check if prescription is approved and unpaid
    if (prescription.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: 'Prescription must be approved before payment' },
        { status: 400 }
      );
    }

    if (prescription.paymentStatus === 'paid') {
      return NextResponse.json(
        { success: false, message: 'Prescription is already paid' },
        { status: 400 }
      );
    }

    // Update prescription to paid status
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        paymentStatus: 'paid',
        status: 'paid',
        paidAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Payment successful',
      data: { prescription: updatedPrescription }
    });

  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
