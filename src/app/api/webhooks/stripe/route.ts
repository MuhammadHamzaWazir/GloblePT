import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createOrderFromPrescription } from '@/lib/order-utils';
import { sendPaymentReceipt } from '@/lib/email-receipts';

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    console.log('📥 Stripe webhook received:', event.type);

    // Handle the checkout session completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      console.log('💳 Payment successful for session:', session.id);
      console.log('📋 Session metadata:', session.metadata);
      
      // Get the prescription ID from metadata
      const prescriptionId = parseInt(session.metadata.prescriptionId);
      
      if (!prescriptionId) {
        console.error('❌ No prescription ID found in session metadata');
        return NextResponse.json({ error: 'No prescription ID found' }, { status: 400 });
      }
      
      try {
        // Start a transaction to update prescription and create order
        await prisma.$transaction(async (tx) => {
          // Update prescription to paid status
          const updatedPrescription = await tx.prescription.update({
            where: { id: prescriptionId },
            data: {
              paymentStatus: 'paid',
              status: 'paid',
              paidAt: new Date(),
              stripePaymentIntentId: session.payment_intent,
              stripeChargeId: session.payment_intent // This will be updated when we get the charge info
            },
            include: { user: true }
          });

          console.log('✅ Prescription updated to paid status:', updatedPrescription.id);

          // Create order from prescription
          const order = await createOrderFromPrescription(prescriptionId, {
            stripePaymentIntentId: session.payment_intent,
            stripeChargeId: session.payment_intent,
            paidAt: new Date()
          });

          console.log('📦 Order created successfully:', order.orderNumber);
          console.log('🎯 Order details:', {
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            status: order.status,
            estimatedDelivery: order.estimatedDelivery
          });

          // Send payment receipt email to customer
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
                stripePaymentIntentId: session.payment_intent,
                method: 'Card Payment'
              }
            });

            console.log('📧 Payment receipt email sent successfully');
          } catch (emailError) {
            console.error('⚠️ Failed to send payment receipt email:', emailError);
            // Don't fail the webhook for email errors
          }

          // Log successful processing
          console.log(`🎉 Payment processing complete:
            - Prescription ${prescriptionId} marked as paid
            - Order ${order.orderNumber} created
            - Payment receipt sent to ${updatedPrescription.user.email}
            - Customer ${order.userId} notified`);
        });

      } catch (dbError: any) {
        console.error('❌ Failed to process payment completion:', dbError);
        return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
      }
    }

    // Handle payment intent succeeded (additional confirmation)
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      
      console.log('💰 Payment intent succeeded:', paymentIntent.id);
      
      // Update any orders with this payment intent ID to include charge information
      try {
        const orders = await prisma.order.findMany({
          where: { stripePaymentIntentId: paymentIntent.id }
        });
        
        for (const order of orders) {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              stripeChargeId: paymentIntent.latest_charge
            }
          });
          
          console.log(`🔄 Updated order ${order.orderNumber} with charge ID: ${paymentIntent.latest_charge}`);
        }
      } catch (error) {
        console.error('⚠️ Failed to update charge information:', error);
        // Don't fail the webhook for this
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
