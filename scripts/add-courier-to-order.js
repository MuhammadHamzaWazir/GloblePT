const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCourierToOrder() {
  try {
    console.log('=== Adding Courier Name to Test Order ===\n');
    
    // Find orders with tracking numbers
    const orders = await prisma.order.findMany({
      where: {
        trackingNumber: {
          not: null
        }
      },
      take: 3,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        trackingNumber: true,
        courierName: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });
    
    console.log('Orders with tracking numbers:');
    orders.forEach(order => {
      console.log(`- Order #${order.orderNumber}: ${order.status}`);
      console.log(`  Tracking: ${order.trackingNumber}`);
      console.log(`  Courier: ${order.courierName || 'None'}`);
      console.log(`  User: ${order.user.name}`);
      console.log('');
    });
    
    if (orders.length > 0) {
      const testOrder = orders[0];
      
      console.log(`\nUpdating Order #${testOrder.orderNumber} with courier information...`);
      
      // Update the order with courier name
      const updatedOrder = await prisma.order.update({
        where: { id: testOrder.id },
        data: {
          courierName: 'Royal Mail'
        }
      });
      
      console.log('✅ Order updated successfully!');
      console.log(`📦 Status: ${updatedOrder.status}`);
      console.log(`🚚 Tracking Number: ${updatedOrder.trackingNumber}`);
      console.log(`🏢 Courier: ${updatedOrder.courierName}`);
      console.log('\nNow visit the dashboard to see the tracking number with courier name!');
    } else {
      console.log('No orders with tracking numbers found.');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addCourierToOrder();
