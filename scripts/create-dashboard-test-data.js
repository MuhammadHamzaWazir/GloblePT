const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🧪 Creating test data for dashboard...');

    // Find a test user (customer1)
    const user = await prisma.user.findFirst({
      where: {
        email: 'customer1@mailinator.com'
      }
    });

    if (!user) {
      console.log('❌ User not found. Please create customer1@mailinator.com first.');
      return;
    }

    console.log('✅ Found user:', user.name, '(', user.email, ')');

    // Create some test prescriptions if they don't exist
    const existingPrescriptions = await prisma.prescription.findMany({
      where: { userId: user.id }
    });

    console.log('📋 Existing prescriptions:', existingPrescriptions.length);

    // Create test prescriptions with different statuses
    const testPrescriptions = [
      {
        medicine: 'Paracetamol 500mg',
        quantity: 30,
        amount: 12.50,
        status: 'pending',
        paymentStatus: 'unpaid',
        deliveryAddress: 'Test Address 1'
      },
      {
        medicine: 'Ibuprofen 400mg',
        quantity: 20,
        amount: 8.75,
        status: 'approved',
        paymentStatus: 'unpaid',
        deliveryAddress: 'Test Address 2'
      },
      {
        medicine: 'Amoxicillin 250mg',
        quantity: 21,
        amount: 15.20,
        status: 'completed',
        paymentStatus: 'paid',
        deliveryAddress: 'Test Address 3'
      },
      {
        medicine: 'Vitamin D 1000IU',
        quantity: 60,
        amount: 9.99,
        status: 'delivered',
        paymentStatus: 'paid',
        deliveryAddress: 'Test Address 4'
      }
    ];

    if (existingPrescriptions.length < 4) {
      for (const prescription of testPrescriptions) {
        const created = await prisma.prescription.create({
          data: {
            ...prescription,
            userId: user.id
          }
        });
        console.log('✅ Created prescription:', created.medicine, '- Status:', created.status);
      }
    }

    // Create test orders if they don't exist
    const existingOrders = await prisma.order.findMany({
      where: { userId: user.id }
    });

    console.log('📦 Existing orders:', existingOrders.length);

    if (existingOrders.length === 0) {
      // Get prescriptions that need orders
      const paidPrescriptions = await prisma.prescription.findMany({
        where: {
          userId: user.id,
          paymentStatus: 'paid'
        }
      });

      for (const prescription of paidPrescriptions) {
        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: user.id,
            prescriptionId: prescription.id,
            totalAmount: prescription.amount,
            deliveryAddress: prescription.deliveryAddress,
            status: 'confirmed',
            paidAt: new Date()
          }
        });
        console.log('✅ Created order:', order.orderNumber, '- Amount: £', order.totalAmount);
      }
    }

    // Display current statistics
    const prescriptions = await prisma.prescription.findMany({
      where: { userId: user.id }
    });

    const orders = await prisma.order.findMany({
      where: { userId: user.id }
    });

    console.log('\n📊 DASHBOARD STATISTICS:');
    console.log('Total Prescriptions:', prescriptions.length);
    console.log('Pending Prescriptions:', prescriptions.filter(p => p.status === 'pending').length);
    console.log('Approved Prescriptions:', prescriptions.filter(p => p.status === 'approved').length);
    console.log('Completed Prescriptions:', prescriptions.filter(p => p.status === 'completed' || p.status === 'delivered').length);
    console.log('Total Orders:', orders.length);
    console.log('Paid Orders:', orders.filter(o => o.paidAt !== null).length);
    console.log('Total Spent: £', orders.filter(o => o.paidAt !== null).reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2));

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
