#!/usr/bin/env node

/**
 * PAYMENT SUCCESS TEST
 * Tests the payment success flow with real Stripe session
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testPaymentSuccess() {
  console.log('🎯 PAYMENT SUCCESS FLOW TEST');
  console.log('============================');
  
  try {
    // Check current prescriptions
    const prescriptions = await prisma.prescription.findMany({
      where: { 
        paymentStatus: 'unpaid',
        status: 'approved'
      },
      include: { user: true }
    });
    
    console.log('💊 Available prescriptions for payment:');
    prescriptions.forEach(p => {
      console.log(`   • ${p.user.name} (${p.user.email}): ${p.medicine} - £${p.amount}`);
    });
    
    if (prescriptions.length === 0) {
      console.log('❌ No unpaid prescriptions found');
      return;
    }
    
    const testPrescription = prescriptions[0];
    console.log(`\n✅ Testing with: ${testPrescription.medicine} for ${testPrescription.user.name}`);
    
    // Create a Stripe session for testing
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `Prescription: ${testPrescription.medicine}`,
              description: `Quantity: ${testPrescription.quantity}`,
            },
            unit_amount: Math.round(testPrescription.amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&prescription=${testPrescription.id}&payment_intent={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=cancelled`,
      metadata: {
        prescriptionId: testPrescription.id.toString(),
        customerEmail: testPrescription.user.email,
        customerName: testPrescription.user.name
      }
    });
    
    console.log('✅ Stripe session created successfully');
    console.log(`🔗 Session ID: ${session.id}`);
    console.log(`💳 Payment URL: ${session.url}`);
    
    // Update prescription with session details
    await prisma.prescription.update({
      where: { id: testPrescription.id },
      data: { 
        stripePaymentIntentId: session.payment_intent 
      }
    });
    
    console.log('✅ Prescription updated with session info');
    
    console.log('\n🧪 TESTING FLOW:');
    console.log('================');
    console.log('1. 🌐 Open the payment URL in your browser');
    console.log('2. 💳 Use test card: 4242 4242 4242 4242');
    console.log('3. 📅 Expiry: 12/25, CVC: 123');
    console.log('4. ✅ Complete payment');
    console.log('5. 🔄 Should redirect to dashboard with success message');
    console.log('6. 🎯 Dashboard should immediately update prescription status');
    console.log('7. 📧 Email receipt should be sent');
    
    console.log('\n💡 WHAT SHOULD HAPPEN:');
    console.log('======================');
    console.log('• Payment completes successfully');
    console.log('• Redirects to localhost dashboard with success alert');
    console.log('• Prescription status changes to "paid"');
    console.log('• Payment button disappears');
    console.log('• Shows "Order Preparing" status');
    console.log('• Order is created with proper Stripe details');
    console.log('• Email receipt is sent to customer');
    
    console.log('\n📧 EMAIL VERIFICATION:');
    console.log('======================');
    console.log('Check your Mailtrap inbox at: https://mailtrap.io/inboxes');
    console.log('You should receive a payment receipt email');
    
    console.log('\n🔧 DEBUGGING:');
    console.log('==============');
    console.log('If status doesn\'t update:');
    console.log('• Check browser console for errors');
    console.log('• Check network tab for API calls');
    console.log('• Check server logs for payment processing');
    console.log(`• Verify session ID in URL matches: ${session.id}`);
    
    console.log('\n🎉 READY TO TEST!');
    console.log(`🌐 Payment URL: ${session.url}`);
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentSuccess();
