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

    // Check if prescription can be cancelled
    if (prescription.status === 'dispatched' || prescription.status === 'delivered') {
      return NextResponse.json(
        { success: false, message: 'Cannot cancel prescription that has been dispatched or delivered' },
        { status: 400 }
      );
    }

    if (prescription.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Prescription is already cancelled' },
        { status: 400 }
      );
    }

    // Update prescription to cancelled status
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Prescription cancelled successfully',
      data: { prescription: updatedPrescription }
    });

  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
