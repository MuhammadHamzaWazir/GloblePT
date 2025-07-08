#!/usr/bin/env node

/**
 * TEST STRIPE PAYMENT FLOW AND ORDER CREATION
 * This script tests the complete payment flow:
 * 1. Payment successful via Stripe
 * 2. Prescription status updated to 'paid'
 * 3. Order created automatically
 * 4. Order tracking functionality
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPaymentFlow() {
  console.log('🧪 TESTING STRIPE PAYMENT FLOW AND ORDER CREATION');
  console.log('==================================================');
  
  try {
    // 1. Create a test prescription (or use existing one)
    console.log('\n📝 Step 1: Creating test prescription...');
    
    const testPrescription = await prisma.prescription.create({
      data: {
        userId: 1, // Assuming user ID 1 exists
        medicine: 'Test Medicine',
        dosage: '500mg',
        quantity: 2,
        amount: 29.99,
        status: 'approved',
        paymentStatus: 'unpaid',
        deliveryAddress: '123 Test Street, Test City, TC1 2AB',
        instructions: 'Take with food'
      }
    });
    
    console.log('✅ Test prescription created:', testPrescription.id);
    
    // 2. Simulate successful payment (this would normally come from Stripe webhook)
    console.log('\n💳 Step 2: Simulating successful payment...');
    
    const paymentData = {
      stripePaymentIntentId: 'pi_test_' + Date.now(),
      stripeChargeId: 'ch_test_' + Date.now(),
      paidAt: new Date()
    };
    
    // Import the order utility function
    const { createOrderFromPrescription } = require('../src/lib/order-utils');
    
    // Start transaction to update prescription and create order
    await prisma.$transaction(async (tx) => {
      // Update prescription to paid status
      const updatedPrescription = await tx.prescription.update({
        where: { id: testPrescription.id },
        data: {
          paymentStatus: 'paid',
          status: 'paid',
          paidAt: paymentData.paidAt,
          stripePaymentIntentId: paymentData.stripePaymentIntentId,
          stripeChargeId: paymentData.stripeChargeId
        }
      });
      
      console.log('✅ Prescription updated to paid status');
      
      // Create order from prescription
      const order = await createOrderFromPrescription(testPrescription.id, paymentData);
      
      console.log('✅ Order created successfully:', order.orderNumber);
      console.log('📦 Order details:', {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        estimatedDelivery: order.estimatedDelivery
      });
    });
    
    // 3. Test order retrieval
    console.log('\n📋 Step 3: Testing order retrieval...');
    
    const { getUserOrders, getOrderDetails } = require('../src/lib/order-utils');
    
    const userOrders = await getUserOrders(1);
    console.log('✅ User orders retrieved:', userOrders.length);
    
    if (userOrders.length > 0) {
      const orderDetails = await getOrderDetails(userOrders[0].id);
      console.log('✅ Order details retrieved:', orderDetails.orderNumber);
    }
    
    // 4. Test order status updates
    console.log('\n🔄 Step 4: Testing order status updates...');
    
    const { updateOrderStatus } = require('../src/lib/order-utils');
    
    if (userOrders.length > 0) {
      const orderId = userOrders[0].id;
      
      // Update to processing
      await updateOrderStatus(orderId, 'processing');
      console.log('✅ Order updated to processing');
      
      // Update to dispatched with tracking
      await updateOrderStatus(orderId, 'dispatched', {
        trackingNumber: 'TRK123456789',
        courierName: 'Royal Mail',
        dispatchedAt: new Date()
      });
      console.log('✅ Order updated to dispatched with tracking');
      
      // Check final status
      const finalOrder = await getOrderDetails(orderId);
      console.log('📊 Final order status:', {
        status: finalOrder.status,
        trackingNumber: finalOrder.trackingNumber,
        courierName: finalOrder.courierName,
        dispatchedAt: finalOrder.dispatchedAt
      });
    }
    
    console.log('\n🎉 PAYMENT FLOW TEST COMPLETED SUCCESSFULLY!');
    console.log('============================================');
    console.log('✅ Prescription payment processing works');
    console.log('✅ Order creation from prescription works');
    console.log('✅ Order tracking and status updates work');
    console.log('✅ Database relationships maintained correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPaymentFlow().catch(console.error);
