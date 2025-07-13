const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestComplaint() {
  console.log('📝 Creating test complaint for customer dashboard...\n');

  try {
    // Find a customer user
    let customer = await prisma.user.findFirst({
      where: { 
        role: { name: 'user' }
      }
    });

    if (!customer) {
      console.log('Creating customer user...');
      const customerRole = await prisma.role.findFirst({
        where: { name: 'user' }
      });

      customer = await prisma.user.create({
        data: {
          name: 'Test Customer',
          email: 'customer@example.com',
          password: 'hashedpassword',
          phone: '1234567890',
          address: '123 Customer Street',
          roleId: customerRole.id
        }
      });
    }

    console.log(`👤 Using customer: ${customer.name} (${customer.email})`);

    // Create a test complaint
    const complaint = await prisma.complaint.create({
      data: {
        userId: customer.id,
        title: 'Service Quality Issue',
        description: 'I experienced poor service quality during my recent visit to the pharmacy. The staff seemed unprofessional and the wait time was unreasonably long.',
        category: 'service',
        priority: 'medium',
        status: 'received'
      }
    });

    console.log(`✅ Test complaint created: ID ${complaint.id}`);
    console.log(`   Title: ${complaint.title}`);
    console.log(`   Category: ${complaint.category}`);
    console.log(`   Priority: ${complaint.priority}`);
    console.log(`   Status: ${complaint.status}`);

    // Create another complaint
    const complaint2 = await prisma.complaint.create({
      data: {
        userId: customer.id,
        title: 'Prescription Delivery Delay',
        description: 'My prescription delivery was delayed by 3 days without any notification. This caused inconvenience as I needed the medication urgently.',
        category: 'delivery',
        priority: 'high',
        status: 'investigating'
      }
    });

    console.log(`✅ Second complaint created: ID ${complaint2.id}`);
    console.log(`   Title: ${complaint2.title}`);
    console.log(`   Category: ${complaint2.category}`);
    console.log(`   Priority: ${complaint2.priority}`);
    console.log(`   Status: ${complaint2.status}`);

    // Show all complaints for this user
    const userComplaints = await prisma.complaint.findMany({
      where: { userId: customer.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📋 Total complaints for ${customer.name}: ${userComplaints.length}`);
    userComplaints.forEach((c, index) => {
      console.log(`   ${index + 1}. ${c.title} (${c.status})`);
    });

    console.log('\n✅ Test complaints created successfully!');
    console.log('🌐 You can now view them in the dashboard at:');
    console.log('   - Customer: http://localhost:3000/dashboard/complaints');
    console.log('   - Admin: http://localhost:3000/admin/dashboard/complaints');

  } catch (error) {
    console.error('❌ Error creating test complaint:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestComplaint();
