import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrderFromPrescription } from '@/lib/order-utils';
import { sendPaymentReceipt } from '@/lib/email-receipts';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { payment_intent_id, prescription_id } = body;

    console.log('🎯 Processing payment success for:', { payment_intent_id, prescription_id });

    if (!payment_intent_id || !prescription_id) {
      return NextResponse.json({ error: 'Missing payment_intent_id or prescription_id' }, { status: 400 });
    }

    // Get payment intent details from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    console.log('💳 Payment confirmed successful:', paymentIntent.id);

    // Process the payment in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update prescription to paid status
      const updatedPrescription = await tx.prescription.update({
        where: { id: parseInt(prescription_id) },
        data: {
          paymentStatus: 'paid',
          status: 'paid',
          paidAt: new Date(),
          stripePaymentIntentId: payment_intent_id,
          stripeChargeId: paymentIntent.latest_charge
        },
        include: { user: true }
      });

      console.log('✅ Prescription updated to paid status:', updatedPrescription.id);

      // Create order from prescription
      const order = await createOrderFromPrescription(parseInt(prescription_id), {
        stripePaymentIntentId: payment_intent_id,
        stripeChargeId: paymentIntent.latest_charge,
        paidAt: new Date()
      });

      console.log('📦 Order created successfully:', order.orderNumber);

      // Send payment receipt email
      try {
        await sendPaymentReceipt({
          order: {
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            currency: order.currency,
            paidAt: order.paidAt!,
            estimatedDelivery: order.estimatedDelivery!,
            deliveryAddress: order.deliveryAddress,
            status: order.status
          },
          customer: {
            name: updatedPrescription.user.name,
            email: updatedPrescription.user.email
          },
          prescription: {
            medicine: updatedPrescription.medicine,
            dosage: updatedPrescription.dosage || 'As prescribed',
            quantity: updatedPrescription.quantity,
            instructions: updatedPrescription.instructions || undefined
          },
          payment: {
            stripePaymentIntentId: payment_intent_id,
            method: 'Card Payment'
          }
        });

        console.log('📧 Payment receipt email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send payment receipt email:', emailError);
        // Don't fail the entire transaction if email fails
      }

      return {
        prescription: updatedPrescription,
        order: order
      };
    });

    console.log('🎉 Payment processing completed successfully');

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
    console.error('❌ Payment processing failed:', error);
    return NextResponse.json({ 
      error: 'Payment processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
