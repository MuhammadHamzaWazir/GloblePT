import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);
    
    if (!user) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const prescriptionId = parseInt(params.id);
    
    if (isNaN(prescriptionId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid prescription ID' },
        { status: 400 }
      );
    }

    // Get the prescription
    const prescription = await prisma.prescription.findUnique({
      where: { 
        id: prescriptionId,
        userId: parseInt(user.id) // Ensure user owns the prescription
      },
      include: { user: true }
    });

    if (!prescription) {
      return NextResponse.json(
        { success: false, message: 'Prescription not found or access denied' },
        { status: 404 }
      );
    }

    // Check if prescription is approved/ready and unpaid
    if (!['approved', 'ready_to_ship'].includes(prescription.status)) {
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

    // Initialize Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Stripe secret key not configured');
      return NextResponse.json({ 
        success: false, 
        message: "Payment system not configured" 
      }, { status: 500 });
    }

    try {
      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'gbp',
              product_data: {
                name: `Prescription: ${prescription.medicine}`,
                description: `Quantity: ${prescription.quantity}`,
              },
              unit_amount: Math.round(prescription.amount * 100), // Convert to pence
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?payment=success&prescription=${prescriptionId}&payment_intent={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?payment=cancelled`,
        metadata: {
          prescriptionId: prescriptionId.toString(),
          userId: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        redirectUrl: session.url,
        sessionId: session.id,
        amount: prescription.amount,
        currency: 'gbp',
        prescriptionId: prescriptionId,
        medicine: prescription.medicine
      });

    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      return NextResponse.json({
        success: false,
        message: `Payment processing failed: ${stripeError.message}`
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
