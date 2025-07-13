#!/usr/bin/env node

/**
 * QUICK PAYMENT TEST
 * Simple test for the payment system
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function quickPaymentTest() {
  console.log('💳 QUICK PAYMENT TEST');
  console.log('====================');
  
  try {
    // Find customer with approved prescription
    const customers = await prisma.user.findMany({
      where: { 
        role: { name: 'user' }
      },
      include: {
        prescriptions: {
          where: { 
            status: 'approved', 
            paymentStatus: 'unpaid' 
          }
        }
      }
    });
    
    console.log('👥 Available customers:');
    customers.forEach(customer => {
      console.log(`   • ${customer.name} (${customer.email}) - ${customer.prescriptions.length} prescriptions`);
    });
    
    const testCustomer = customers.find(c => c.prescriptions.length > 0);
    
    if (!testCustomer) {
      console.log('❌ No customer with approved prescriptions found');
      return;
    }
    
    const prescription = testCustomer.prescriptions[0];
    console.log(`\n✅ Found test customer: ${testCustomer.name}`);
    console.log(`📧 Email: ${testCustomer.email}`);
    console.log(`💊 Prescription: ${prescription.medicine}`);
    console.log(`💰 Amount: £${prescription.amount}`);
    
    // Create Stripe PaymentIntent
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(prescription.amount * 100),
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: {
        prescription_id: prescription.id.toString(),
        customer_email: testCustomer.email,
      },
    });
    
    console.log(`✅ PaymentIntent created: ${paymentIntent.id}`);
    
    // Update prescription
    await prisma.prescription.update({
      where: { id: prescription.id },
      data: { stripePaymentIntentId: paymentIntent.id }
    });
    
    console.log('✅ Prescription updated with PaymentIntent');
    
    console.log('\n🧪 TESTING STEPS:');
    console.log('=================');
    console.log('1. 🌐 Go to: http://localhost:3000');
    console.log(`2. 🔐 Login: ${testCustomer.email} / Customer@2024`);
    console.log('3. 📋 Go to Dashboard');
    console.log('4. 💳 Click "Pay Now" on the prescription');
    console.log('5. 🔄 Payment should stay on localhost');
    console.log('6. 💰 Use test card: 4242 4242 4242 4242');
    console.log('7. 📅 Expiry: 12/25, CVC: 123');
    console.log('8. ✅ Complete payment');
    console.log('9. 🔄 Should return to localhost dashboard');
    console.log('10. 📧 Check Mailtrap for email receipt');
    
    // Check email settings
    console.log('\n📧 EMAIL SETTINGS:');
    console.log('==================');
    console.log(`Host: ${process.env.SMTP_HOST}`);
    console.log(`User: ${process.env.SMTP_USER}`);
    console.log(`From: ${process.env.SMTP_FROM}`);
    console.log('📮 Mailtrap inbox: https://mailtrap.io/inboxes');
    
    console.log('\n🎯 EXPECTED BEHAVIOR:');
    console.log('=====================');
    console.log('• Payment redirects to Stripe but stays on localhost domain');
    console.log('• After payment, returns to localhost dashboard');
    console.log('• Prescription status changes to "paid"');
    console.log('• Order is created');
    console.log('• Email receipt is sent to customer');
    console.log('• Dashboard shows "Order Preparing"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickPaymentTest();
