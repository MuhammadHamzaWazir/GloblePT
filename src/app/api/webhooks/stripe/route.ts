import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // Handle the checkout session completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Get the prescription ID from metadata
      const prescriptionId = parseInt(session.metadata.prescriptionId);
      
      if (prescriptionId) {
        try {
          // Update prescription to paid status
          const updatedPrescription = await prisma.prescription.update({
            where: { id: prescriptionId },
            data: {
              paymentStatus: 'paid',
              status: 'paid',
              paidAt: new Date()
            }
          });

          console.log(`Prescription ${prescriptionId} marked as paid via Stripe`);
        } catch (dbError) {
          console.error('Failed to update prescription status:', dbError);
          return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
