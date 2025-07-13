const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrescriptionUpdate() {
  try {
    console.log('Testing prescription update with courier information...');
    
    // Find a ready_to_ship prescription
    const prescription = await prisma.prescription.findFirst({
      where: {
        status: 'ready_to_ship'
      },
      include: {
        order: true
      }
    });
    
    if (!prescription) {
      console.log('No ready_to_ship prescription found. Creating one...');
      // We'll just test the field availability
      const testPrescription = await prisma.prescription.findFirst();
      console.log('Found prescription ID:', testPrescription?.id);
      return;
    }
    
    console.log('Found prescription ID:', prescription.id);
    console.log('Current status:', prescription.status);
    console.log('Current tracking number:', prescription.trackingNumber);
    console.log('Current courier name:', prescription.courierName);
    
    // Update prescription with courier information
    const updateData = {
      status: 'dispatched',
      trackingNumber: 'TEST123456789',
      courierName: 'DHL Express',
      dispatchedAt: new Date()
    };
    
    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescription.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            address: true
          }
        },
        order: true
      }
    });
    
    console.log('✅ Prescription updated successfully!');
    console.log('New status:', updatedPrescription.status);
    console.log('New tracking number:', updatedPrescription.trackingNumber);
    console.log('New courier name:', updatedPrescription.courierName);
    
    // Also update the corresponding order if it exists
    if (updatedPrescription.order) {
      const orderUpdateData = {
        status: 'dispatched',
        dispatchedAt: new Date(),
        trackingNumber: 'TEST123456789',
        courierName: 'DHL Express'
      };
      
      const updatedOrder = await prisma.order.update({
        where: { id: updatedPrescription.order.id },
        data: orderUpdateData
      });
      
      console.log('✅ Order updated successfully!');
      console.log('Order status:', updatedOrder.status);
      console.log('Order tracking number:', updatedOrder.trackingNumber);
      console.log('Order courier name:', updatedOrder.courierName);
    }
    
  } catch (error) {
    console.error('❌ Error testing prescription update:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPrescriptionUpdate();
