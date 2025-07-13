#!/usr/bin/env node

/**
 * PAYMENT VERIFICATION SCRIPT
 * Verifies that payment processing works correctly
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function verifyPaymentSystem() {
  console.log('🔍 PAYMENT SYSTEM VERIFICATION');
  console.log('==============================');
  
  try {
    // Check current database state
    console.log('\n1. 📊 CURRENT DATABASE STATE:');
    console.log('=============================');
    
    const allPrescriptions = await prisma.prescription.findMany({
      include: { user: true, order: true }
    });
    
    console.log('\n💊 ALL PRESCRIPTIONS:');
    allPrescriptions.forEach(p => {
      console.log(`   • ${p.user.name}: ${p.medicine} - £${p.amount}`);
      console.log(`     Status: ${p.status} | Payment: ${p.paymentStatus}`);
      console.log(`     Stripe ID: ${p.stripePaymentIntentId || 'None'}`);
      console.log(`     Order: ${p.order ? p.order.orderNumber : 'None'}`);
      console.log('');
    });
    
    const unpaidPrescriptions = allPrescriptions.filter(p => p.paymentStatus === 'unpaid');
    const paidPrescriptions = allPrescriptions.filter(p => p.paymentStatus === 'paid');
    
    console.log(`📊 SUMMARY:`);
    console.log(`   💳 Unpaid prescriptions: ${unpaidPrescriptions.length}`);
    console.log(`   ✅ Paid prescriptions: ${paidPrescriptions.length}`);
    console.log(`   📦 Orders created: ${allPrescriptions.filter(p => p.order).length}`);
    
    // Check orders
    console.log('\n2. 📦 ORDERS IN DATABASE:');
    console.log('=========================');
    
    const orders = await prisma.order.findMany({
      include: { user: true, prescription: true }
    });
    
    if (orders.length === 0) {
      console.log('   No orders found in database');
    } else {
      orders.forEach(order => {
        console.log(`   • Order ${order.orderNumber}`);
        console.log(`     Customer: ${order.user.name} (${order.user.email})`);
        console.log(`     Amount: £${order.totalAmount}`);
        console.log(`     Status: ${order.status}`);
        console.log(`     Stripe Payment ID: ${order.stripePaymentIntentId || 'None'}`);
        console.log(`     Paid At: ${order.paidAt ? order.paidAt.toLocaleString() : 'Not set'}`);
        console.log('');
      });
    }
    
    // Check email configuration
    console.log('\n3. 📧 EMAIL CONFIGURATION:');
    console.log('===========================');
    console.log(`   Host: ${process.env.SMTP_HOST}`);
    console.log(`   Port: ${process.env.SMTP_PORT}`);
    console.log(`   User: ${process.env.SMTP_USER}`);
    console.log(`   From: ${process.env.SMTP_FROM}`);
    console.log(`   Mailtrap: ${process.env.SMTP_HOST?.includes('mailtrap') ? 'YES' : 'NO'}`);
    
    // Check Stripe configuration
    console.log('\n4. 💳 STRIPE CONFIGURATION:');
    console.log('============================');
    console.log(`   Secret Key: ${process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`   Public Key: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET'}`);
    console.log(`   App URL: ${process.env.NEXT_PUBLIC_APP_URL}`);
    
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const account = await stripe.accounts.retrieve();
      console.log(`   Account: ${account.id}`);
      console.log(`   Mode: ${account.livemode ? 'Live' : 'Test'}`);
    }
    
    console.log('\n5. 🎯 TESTING RECOMMENDATIONS:');
    console.log('===============================');
    
    if (unpaidPrescriptions.length > 0) {
      const testPrescription = unpaidPrescriptions[0];
      console.log(`✅ Ready to test payment with:`);
      console.log(`   Customer: ${testPrescription.user.name} (${testPrescription.user.email})`);
      console.log(`   Medicine: ${testPrescription.medicine}`);
      console.log(`   Amount: £${testPrescription.amount}`);
      console.log('');
      console.log('🧪 TEST STEPS:');
      console.log('1. Login to dashboard: http://localhost:3000');
      console.log(`2. Use credentials: ${testPrescription.user.email} / Customer@2024`);
      console.log('3. Click "Pay Now" on the prescription');
      console.log('4. Use test card: 4242 4242 4242 4242');
      console.log('5. Complete payment');
      console.log('6. Verify status updates and email is sent');
    } else {
      console.log('❌ No unpaid prescriptions available for testing');
      console.log('   Run: node create-complete-users.js to reset test data');
    }
    
    console.log('\n6. 🔧 TROUBLESHOOTING:');
    console.log('=======================');
    console.log('If payment doesn\'t update status:');
    console.log('• Check browser console for errors');
    console.log('• Check network tab for failed API calls');
    console.log('• Verify session ID in URL after payment');
    console.log('• Check server logs for payment processing');
    console.log('• Ensure /api/payment-success endpoint is working');
    
    console.log('\n7. 🎉 EXPECTED BEHAVIOR:');
    console.log('========================');
    console.log('After successful payment:');
    console.log('• Alert shows "Payment successful!"');
    console.log('• Prescription status changes to "paid"');
    console.log('• Payment button disappears');
    console.log('• Shows "Order Preparing" status');
    console.log('• Order appears in database');
    console.log('• Email receipt sent to customer');
    console.log('• Mailtrap inbox receives email');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPaymentSystem();
