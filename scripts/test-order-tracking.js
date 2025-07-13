const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrderTrackingUpdate() {
  try {
    console.log('=== Testing Order Tracking Number Display ===\n');

    // 1. Find an existing order or create a test order
    let order = await prisma.order.findFirst({
      include: {
        user: true,
        prescription: true
      }
    });

    if (!order) {
      console.log('No existing orders found. Creating test order...');
      
      // Find a user
      const user = await prisma.user.findFirst({
        where: { role: 'customer' }
      });

      if (!user) {
        console.log('No customer user found. Please create a customer user first.');
        return;
      }

      // Find a prescription
      const prescription = await prisma.prescription.findFirst({
        where: { userId: user.id }
      });

      if (!prescription) {
        console.log('No prescription found. Creating test prescription...');
        
        const newPrescription = await prisma.prescription.create({
          data: {
            userId: user.id,
            medicine: 'Test Medicine',
            dosage: '10mg',
            quantity: 30,
            instructions: 'Take once daily',
            amount: 25.99,
            paymentMethod: 'card',
            paymentStatus: 'paid',
            status: 'approved'
          }
        });

        order = await prisma.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}`,
            userId: user.id,
            prescriptionId: newPrescription.id,
            totalAmount: 25.99,
            deliveryAddress: user.address,
            deliveryMethod: 'standard',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            status: 'confirmed'
          }
        });
      } else {
        order = await prisma.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}`,
            userId: user.id,
            prescriptionId: prescription.id,
            totalAmount: prescription.amount,
            deliveryAddress: user.address,
            deliveryMethod: 'standard',
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'confirmed'
          }
        });
      }

      console.log('Test order created:', order.orderNumber);
    }

    // 2. Display current order status
    console.log('Current Order Status:');
    console.log('Order Number:', order.orderNumber);
    console.log('Status:', order.status);
    console.log('Tracking Number:', order.trackingNumber || 'Not set');
    console.log('Courier:', order.courierName || 'Not set');

    // 3. Update order to dispatched with tracking number
    console.log('\n📦 Updating order to DISPATCHED with tracking number...');
    
    const trackingNumber = `RM${Math.floor(Math.random() * 1000000000)}GB`;
    const courierName = 'Royal Mail';

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'dispatched',
        trackingNumber: trackingNumber,
        courierName: courierName,
        dispatchedAt: new Date()
      }
    });

    console.log('✅ Order updated successfully!');
    console.log('Updated Order Status:');
    console.log('Order Number:', updatedOrder.orderNumber);
    console.log('Status:', updatedOrder.status);
    console.log('Tracking Number:', updatedOrder.trackingNumber);
    console.log('Courier:', updatedOrder.courierName);
    console.log('Dispatched At:', updatedOrder.dispatchedAt);

    // 4. Simulate fetching order for display
    console.log('\n🖥️  Simulating frontend order display...');
    const orderForDisplay = await prisma.order.findUnique({
      where: { id: updatedOrder.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        prescription: {
          select: {
            id: true,
            medicine: true,
            quantity: true,
            amount: true,
            status: true
          }
        }
      }
    });

    console.log('Order for frontend display:');
    console.log(JSON.stringify({
      id: orderForDisplay.id,
      orderNumber: orderForDisplay.orderNumber,
      status: orderForDisplay.status,
      totalAmount: orderForDisplay.totalAmount,
      trackingNumber: orderForDisplay.trackingNumber,
      courierName: orderForDisplay.courierName,
      estimatedDelivery: orderForDisplay.estimatedDelivery,
      createdAt: orderForDisplay.createdAt,
      dispatchedAt: orderForDisplay.dispatchedAt,
      customer: orderForDisplay.user.name,
      medicine: orderForDisplay.prescription.medicine
    }, null, 2));

    console.log('\n✨ Test completed! The tracking number will now be prominently displayed when order status is "dispatched"');
    console.log('\n📱 To see this in action:');
    console.log('1. Go to http://localhost:3000/dashboard/orders');
    console.log('2. Look for the order with a "dispatched" status');
    console.log('3. You should see a highlighted blue section with the tracking number');
    console.log('4. Click "Track Now" to follow the package');

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderTrackingUpdate();
