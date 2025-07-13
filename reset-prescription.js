#!/usr/bin/env node

/**
 * RESET PRESCRIPTION FOR TESTING
 * Resets a prescription to unpaid status for testing
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetPrescription() {
  console.log('🔄 RESETTING PRESCRIPTION FOR TESTING');
  console.log('=====================================');
  
  try {
    // Reset John Smith's prescription to unpaid
    const prescription = await prisma.prescription.findFirst({
      where: { 
        user: { email: 'customer1@mailinator.com' }
      }
    });
    
    if (!prescription) {
      console.log('❌ Prescription not found');
      return;
    }
    
    // Delete the order first
    await prisma.order.deleteMany({
      where: { prescriptionId: prescription.id }
    });
    
    // Reset prescription
    await prisma.prescription.update({
      where: { id: prescription.id },
      data: {
        paymentStatus: 'unpaid',
        status: 'approved',
        paidAt: null,
        stripePaymentIntentId: null,
        stripeChargeId: null
      }
    });
    
    console.log('✅ Prescription reset to unpaid status');
    console.log('✅ Order deleted');
    
    console.log('\n🎯 NOW YOU CAN TEST:');
    console.log('===================');
    console.log('1. Login as: customer1@mailinator.com / Customer@2024');
    console.log('2. Pay for: Paracetamol 500mg (£12.99)');
    console.log('3. Use test card: 4242 4242 4242 4242');
    console.log('4. Check if status updates immediately in dashboard');
    console.log('5. Verify order is created and status shows "Order Preparing"');
    
  } catch (error) {
    console.error('❌ Reset failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPrescription();
