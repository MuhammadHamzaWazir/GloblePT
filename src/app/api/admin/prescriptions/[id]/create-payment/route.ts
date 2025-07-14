import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse, handleApiError } from "@/lib/api-helpers";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil',
});

// POST /api/admin/prescriptions/[id]/create-payment - Create payment intent for approved prescription
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and admin role
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
    if (!user || user.role.toUpperCase() !== 'ADMIN') {
      return createErrorResponse("Unauthorized access", 403);
    }

    const prescriptionId = parseInt(params.id);
    if (isNaN(prescriptionId)) {
      return createErrorResponse("Invalid prescription ID", 400);
    }

    // Get prescription details
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
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

    if (!prescription) {
      return createErrorResponse("Prescription not found", 404);
    }

    // Only allow payment creation for approved prescriptions
    if (prescription.status !== 'approved') {
      return createErrorResponse("Can only create payment for approved prescriptions", 400);
    }

    // Check if payment already exists (using a simple status check for now)
    if (prescription.paymentStatus === 'paid') {
      return createErrorResponse("Payment already completed for this prescription", 400);
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(prescription.amount * 100), // Convert to cents
      currency: 'gbp',
      receipt_email: prescription.user.email,
      metadata: {
        prescriptionId: prescription.id.toString(),
        customerId: prescription.user.id.toString(),
        medicine: prescription.medicine
      },
      description: `Prescription payment for ${prescription.medicine} - ${prescription.user.name}`
    });

    // Update prescription status to indicate payment intent created
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        // For now, we'll track the payment intent ID in a comment or separate tracking
        status: 'payment_pending'
      },
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
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency
      },
      message: "Payment intent created successfully"
    });

  } catch (error) {
    return handleApiError(error);
  }
}
