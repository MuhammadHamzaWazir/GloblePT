#!/usr/bin/env node

/**
 * SIMPLE PAYMENT TEST SCRIPT
 * Creates a test payment and provides browser testing instructions
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createTestPayment() {
  console.log('💳 PAYMENT TESTING SETUP');
  console.log('=========================');
  
  try {
    // Find customer with approved prescription
    const customer = await prisma.user.findFirst({
      where: { email: 'customer1@example.com' },
      include: {
        prescriptions: {
          where: { status: 'approved', paymentStatus: 'unpaid' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    
    if (!customer || !customer.prescriptions.length) {
      console.log('❌ No test customer with approved prescription found');
      return;
    }
    
    const prescription = customer.prescriptions[0];
    console.log(`👤 Customer: ${customer.name} (${customer.email})`);
    console.log(`💊 Medicine: ${prescription.medicine}`);
    console.log(`💰 Amount: £${prescription.amount}`);
    
    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(prescription.amount * 100),
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        prescription_id: prescription.id.toString(),
        customer_email: customer.email,
        customer_name: customer.name,
      },
    });
    
    // Update prescription with payment intent ID
    await prisma.prescription.update({
      where: { id: prescription.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });
    
    console.log('✅ Payment setup complete!');
    console.log(`🔐 PaymentIntent ID: ${paymentIntent.id}`);
    
    // Testing instructions
    console.log('\n🧪 TESTING INSTRUCTIONS:');
    console.log('========================');
    console.log('1. Open your browser and go to: http://localhost:3000');
    console.log('2. Login with: customer1@example.com / Customer@2024');
    console.log('3. Go to Dashboard and find the approved prescription');
    console.log('4. Click "Pay Now" to start the payment process');
    console.log('5. Use Stripe test card: 4242 4242 4242 4242');
    console.log('6. Expiry: 12/25, CVC: 123');
    console.log('7. Complete the payment');
    console.log('8. Check that order is created and email is sent');
    
    console.log('\n💡 VERIFICATION STEPS:');
    console.log('======================');
    console.log('• Payment should complete successfully');
    console.log('• Prescription status should change to "paid"');
    console.log('• Order should be created in database');
    console.log('• Email receipt should be sent (check Mailtrap inbox)');
    console.log('• Stripe webhook should process the payment');
    
  } catch (error) {
    console.error('❌ Error setting up payment test:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPayment();
