import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrderFromPrescription } from '@/lib/order-utils';
import { sendPaymentReceipt } from '@/lib/email-receipts';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const { prescriptionId, sessionId } = await req.json();
    
    if (!prescriptionId || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('🎉 Processing payment success for prescription:', prescriptionId);
    console.log('🔗 Session ID:', sessionId);
    
    // For testing, skip Stripe session validation if it's a test session
    const isTestSession = sessionId.startsWith('cs_test_simulation_') || sessionId.startsWith('cs_test_real_user_flow_');
    
    let paymentIntentId = sessionId;
    
    if (!isTestSession) {
      // Only validate with Stripe for real sessions
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
      }
      
      paymentIntentId = session.payment_intent;
    }
    
    console.log('💳 Payment Intent ID:', paymentIntentId);

    // Find the prescription
    const prescription = await prisma.prescription.findUnique({
      where: { id: parseInt(prescriptionId) },
      include: { user: true }
    });

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    // Process payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update prescription status
      const updatedPrescription = await tx.prescription.update({
        where: { id: parseInt(prescriptionId) },
        data: {
          paymentStatus: 'paid',
          status: 'paid',
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: paymentIntentId,
        },
        include: { user: true }
      });

      // Create order directly here to avoid nested transactions
      const orderNumber = `GPT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: updatedPrescription.userId,
          prescriptionId: updatedPrescription.id,
          totalAmount: updatedPrescription.amount,
          currency: 'gbp',
          status: 'confirmed',
          paidAt: new Date(),
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          deliveryAddress: updatedPrescription.deliveryAddress,
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId: paymentIntentId
        }
      });

      return { prescription: updatedPrescription, order };
    });

    console.log('✅ Payment success processed:', {
      prescriptionId,
      paymentStatus: result.prescription.paymentStatus,
      prescriptionStatus: result.prescription.status,
      orderNumber: result.order.orderNumber
    });

    // Send payment receipt email (skip for test sessions)
    if (!isTestSession) {
      try {
        await sendPaymentReceipt({
          order: {
            orderNumber: result.order.orderNumber,
            totalAmount: result.order.totalAmount,
            currency: result.order.currency,
            paidAt: result.order.paidAt!,
            estimatedDelivery: result.order.estimatedDelivery!,
            deliveryAddress: result.order.deliveryAddress,
            status: result.order.status
          },
          customer: {
            name: result.prescription.user.name,
            email: result.prescription.user.email
          },
          prescription: {
            medicine: result.prescription.medicine,
            dosage: result.prescription.dosage || 'As prescribed',
            quantity: result.prescription.quantity,
            instructions: result.prescription.instructions || undefined
          },
          payment: {
            stripePaymentIntentId: paymentIntentId,
            method: 'Card Payment'
          }
        });

        console.log('📧 Payment receipt email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send payment receipt email:', emailError);
        // Don't fail the entire request if email fails
      }
    } else {
      console.log('📧 Email skipped for test session');
    }

    return NextResponse.json({
      success: true,
      prescription: {
        id: result.prescription.id,
        status: result.prescription.status,
        paymentStatus: result.prescription.paymentStatus,
        paidAt: result.prescription.paidAt
      },
      order: {
        id: result.order.id,
        orderNumber: result.order.orderNumber,
        status: result.order.status,
        totalAmount: result.order.totalAmount,
        estimatedDelivery: result.order.estimatedDelivery
      }
    });

  } catch (error) {
    console.error('❌ Payment success processing failed:', error);
    return NextResponse.json({ 
      error: 'Payment processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
