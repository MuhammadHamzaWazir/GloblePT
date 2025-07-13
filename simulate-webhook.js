#!/usr/bin/env node

/**
 * WEBHOOK SIMULATION TEST
 * Simulates the Stripe webhook to test database updates
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function simulateWebhook() {
  console.log('🔄 WEBHOOK SIMULATION TEST');
  console.log('==========================');
  
  try {
    // Find a prescription with payment intent
    const prescription = await prisma.prescription.findFirst({
      where: { 
        stripePaymentIntentId: { not: null },
        paymentStatus: 'unpaid'
      },
      include: { user: true }
    });
    
    if (!prescription) {
      console.log('❌ No prescription with payment intent found');
      return;
    }
    
    console.log(`📋 Found prescription: ${prescription.medicine}`);
    console.log(`👤 Customer: ${prescription.user.name} (${prescription.user.email})`);
    console.log(`💰 Amount: £${prescription.amount}`);
    console.log(`🔐 Payment Intent: ${prescription.stripePaymentIntentId}`);
    
    // Simulate webhook processing
    console.log('\n🔄 Simulating webhook processing...');
    
    // Update prescription to paid status
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        paymentStatus: 'paid',
        status: 'paid',
        paidAt: new Date(),
      },
      include: { user: true }
    });
    
    console.log('✅ Prescription updated to paid status');
    
    // Create order
    const orderNumber = `GPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: prescription.userId,
        prescriptionId: prescription.id,
        totalAmount: prescription.amount,
        currency: 'gbp',
        status: 'processing',
        paidAt: new Date(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        deliveryAddress: prescription.deliveryAddress,
        stripePaymentIntentId: prescription.stripePaymentIntentId,
        stripeChargeId: prescription.stripePaymentIntentId
      }
    });
    
    console.log('📦 Order created successfully');
    console.log(`🎯 Order Number: ${order.orderNumber}`);
    console.log(`📊 Order Status: ${order.status}`);
    
    // Show updated prescription status
    const finalPrescription = await prisma.prescription.findUnique({
      where: { id: prescription.id },
      include: { user: true, order: true }
    });
    
    console.log('\n✅ FINAL STATUS:');
    console.log('================');
    console.log(`💊 Prescription Status: ${finalPrescription?.status}`);
    console.log(`💳 Payment Status: ${finalPrescription?.paymentStatus}`);
    console.log(`📦 Order Status: ${finalPrescription?.order?.status}`);
    console.log(`🎫 Order Number: ${finalPrescription?.order?.orderNumber}`);
    
    console.log('\n🎯 WHAT SHOULD HAPPEN IN DASHBOARD:');
    console.log('====================================');
    console.log('• Prescription should show status: "paid"');
    console.log('• Payment button should disappear');
    console.log('• Should show "Order Preparing" status');
    console.log('• Order number should be displayed');
    
    console.log('\n🔧 IF DASHBOARD STILL SHOWS OLD STATUS:');
    console.log('========================================');
    console.log('1. Refresh the dashboard page');
    console.log('2. Check browser console for errors');
    console.log('3. Check if API endpoints are working');
    
  } catch (error) {
    console.error('❌ Webhook simulation failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateWebhook();
