const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupUsers() {
  try {
    console.log('🔍 Setting up users with new schema...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('password123', 10);
    const staffPassword = await bcrypt.hash('password123', 10);
    const customerPassword = await bcrypt.hash('password123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@pharmacy.com',
        password: adminPassword,
        address: '123 Admin Street',
        role: 'admin'
      }
    });
    console.log('✅ Created admin:', admin.email);

    // Create staff user
    const staff = await prisma.user.create({
      data: {
        name: 'Dr. Sarah Johnson',
        email: 'pharmacist@globalpharmatrading.co.uk',
        password: staffPassword,
        address: '456 Staff Avenue',
        role: 'staff'
      }
    });
    console.log('✅ Created staff:', staff.email);

    // Create customer user
    const customer = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'test@example.com',
        password: customerPassword,
        address: '789 Customer Road',
        role: 'customer'
      }
    });
    console.log('✅ Created customer:', customer.email);

    // Create some test complaints
    const complaint1 = await prisma.complaint.create({
      data: {
        userId: customer.id,
        title: 'Test Complaint - Slow Service',
        description: 'The service was very slow during my recent visit.',
        category: 'service',
        priority: 'medium',
        status: 'pending'
      }
    });

    const complaint2 = await prisma.complaint.create({
      data: {
        userId: customer.id,
        title: 'Test Complaint - Medication Issue',
        description: 'There was an issue with my prescription medication.',
        category: 'medication',
        priority: 'high',
        status: 'pending'
      }
    });

    console.log('✅ Created test complaints:', complaint1.id, complaint2.id);

    console.log('\n🎉 Setup complete! You can now:');
    console.log('  - Login as admin: admin@pharmacy.com / password123');
    console.log('  - Login as staff: pharmacist@globalpharmatrading.co.uk / password123');
    console.log('  - Login as customer: test@example.com / password123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupUsers();
