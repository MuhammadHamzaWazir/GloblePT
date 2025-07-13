const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTrackingToOrder() {
  try {
    console.log('=== Adding Tracking Number to Test Order ===\n');
    
    // Find the first order
    const orders = await prisma.order.findMany({
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        trackingNumber: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Current orders:');
    orders.forEach(order => {
      console.log(`- Order #${order.orderNumber}: ${order.status} (User: ${order.user.name})`);
      console.log(`  Tracking: ${order.trackingNumber || 'None'}`);
    });
    
    if (orders.length > 0) {
      const testOrder = orders[0];
      
      // Generate a realistic tracking number
      const trackingNumber = `GB${Math.random().toString().substring(2, 15)}GB`;
      
      console.log(`\nUpdating Order #${testOrder.orderNumber}...`);
      
      // Update the order with dispatched status and tracking number
      const updatedOrder = await prisma.order.update({
        where: { id: testOrder.id },
        data: {
          status: 'dispatched',
          trackingNumber: trackingNumber
        }
      });
      
      console.log('✅ Order updated successfully!');
      console.log(`📦 Status: ${updatedOrder.status}`);
      console.log(`🚚 Tracking Number: ${updatedOrder.trackingNumber}`);
      console.log('\nNow visit the dashboard to see the enhanced tracking display!');
    } else {
      console.log('No orders found. Create an order first.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTrackingToOrder();
