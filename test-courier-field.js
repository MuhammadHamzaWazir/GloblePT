const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCourierField() {
  try {
    console.log('Testing if courierName field is available in Prescription model...');
    
    // Try to find a prescription with courier name
    const prescription = await prisma.prescription.findFirst({
      select: {
        id: true,
        trackingNumber: true,
        courierName: true,
        status: true
      }
    });
    
    console.log('✅ courierName field is available in Prescription model');
    console.log('Sample prescription:', prescription);
    
    // Test Order model as well
    const order = await prisma.order.findFirst({
      select: {
        id: true,
        trackingNumber: true,
        courierName: true,
        status: true
      }
    });
    
    console.log('✅ courierName field is available in Order model');
    console.log('Sample order:', order);
    
  } catch (error) {
    console.error('❌ Error testing courier field:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCourierField();
