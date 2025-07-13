#!/usr/bin/env node

/**
 * DATABASE STATE CHECKER
 * Checks current prescription and order status
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseState() {
  console.log('🔍 DATABASE STATE CHECK');
  console.log('=======================');
  
  try {
    // Check all prescriptions
    const prescriptions = await prisma.prescription.findMany({
      include: { 
        user: true, 
        order: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total prescriptions: ${prescriptions.length}`);
    console.log('');
    
    prescriptions.forEach((prescription, index) => {
      console.log(`${index + 1}. 💊 ${prescription.medicine}`);
      console.log(`   👤 Customer: ${prescription.user.name} (${prescription.user.email})`);
      console.log(`   💰 Amount: £${prescription.amount}`);
      console.log(`   📋 Status: ${prescription.status}`);
      console.log(`   💳 Payment: ${prescription.paymentStatus}`);
      console.log(`   🔐 Payment Intent: ${prescription.stripePaymentIntentId || 'None'}`);
      console.log(`   📦 Order: ${prescription.order ? prescription.order.orderNumber : 'None'}`);
      console.log(`   📅 Paid At: ${prescription.paidAt ? prescription.paidAt.toLocaleString() : 'Not paid'}`);
      console.log('');
    });
    
    // Check orders
    const orders = await prisma.order.findMany({
      include: { 
        user: true, 
        prescription: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📦 Total orders: ${orders.length}`);
    console.log('');
    
    orders.forEach((order, index) => {
      console.log(`${index + 1}. 📦 ${order.orderNumber}`);
      console.log(`   👤 Customer: ${order.user.name}`);
      console.log(`   💊 Medicine: ${order.prescription.medicine}`);
      console.log(`   💰 Amount: £${order.totalAmount}`);
      console.log(`   📊 Status: ${order.status}`);
      console.log(`   📅 Paid At: ${order.paidAt ? order.paidAt.toLocaleString() : 'Not paid'}`);
      console.log(`   🚚 Delivery: ${order.estimatedDelivery ? order.estimatedDelivery.toLocaleDateString() : 'Not set'}`);
      console.log('');
    });
    
    // Find prescriptions ready for payment
    const readyForPayment = prescriptions.filter(p => 
      p.status === 'approved' && p.paymentStatus === 'unpaid'
    );
    
    console.log(`💳 Ready for payment: ${readyForPayment.length} prescriptions`);
    readyForPayment.forEach(p => {
      console.log(`   • ${p.medicine} - ${p.user.name} (${p.user.email})`);
    });
    
    // Find paid prescriptions
    const paidPrescriptions = prescriptions.filter(p => p.paymentStatus === 'paid');
    console.log(`✅ Paid prescriptions: ${paidPrescriptions.length}`);
    paidPrescriptions.forEach(p => {
      console.log(`   • ${p.medicine} - ${p.user.name} - ${p.order ? p.order.orderNumber : 'No order'}`);
    });
    
    console.log('\n🎯 TESTING RECOMMENDATIONS:');
    console.log('============================');
    
    if (readyForPayment.length > 0) {
      const prescription = readyForPayment[0];
      console.log(`1. Login as: ${prescription.user.email} / Customer@2024`);
      console.log(`2. Pay for: ${prescription.medicine} (£${prescription.amount})`);
      console.log(`3. Use test card: 4242 4242 4242 4242`);
      console.log(`4. After payment, check if status updates immediately`);
    } else if (paidPrescriptions.length > 0) {
      console.log('All prescriptions are already paid. Create new test data if needed.');
    } else {
      console.log('No prescriptions found. Run create-complete-users.js first.');
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
