const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting production database seeding...');

  try {
    // Clear existing data in production
    console.log('🧹 Clearing existing data...');
    await prisma.complaint.deleteMany();
    await prisma.order.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Existing data cleared');

    // Create Admin Users
    console.log('👑 Creating admin users...');
    const adminPassword = await bcrypt.hash('Admin@123', 12);
    
    const admin1 = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@globalpt.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1-555-0001',
        address: '123 Main St, City, State 12345',
        accountStatus: 'verified',
      }
    });

    const admin2 = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'superadmin@globalpt.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1-555-0002',
        address: '456 Admin Ave, City, State 12345',
        accountStatus: 'verified',
      }
    });

    console.log('✅ Admin users created');

    // Create Staff Users
    console.log('👩‍⚕️ Creating staff users...');
    const staffPassword = await bcrypt.hash('Staff@123', 12);
    
    const pharmacist1 = await prisma.user.create({
      data: {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.pharmacist@globalpt.com',
        password: staffPassword,
        role: 'staff',
        phone: '+1-555-1001',
        address: '789 Pharmacy Lane, City, State 12345',
        accountStatus: 'verified',
      }
    });

    const pharmacist2 = await prisma.user.create({
      data: {
        name: 'Dr. Michael Chen',
        email: 'michael.pharmacist@globalpt.com',
        password: staffPassword,
        role: 'staff',
        phone: '+1-555-1002',
        address: '321 Medical Drive, City, State 12345',
        accountStatus: 'verified',
      }
    });

    const assistant1 = await prisma.user.create({
      data: {
        name: 'Emily Rodriguez',
        email: 'emily.assistant@globalpt.com',
        password: staffPassword,
        role: 'assistant',
        phone: '+1-555-1003',
        address: '654 Healthcare Blvd, City, State 12345',
        accountStatus: 'verified',
      }
    });

    console.log('✅ Staff users created');

    // Create Customer Users
    console.log('👥 Creating customer users...');
    const customerPassword = await bcrypt.hash('Customer@123', 12);
    
    const customers = await Promise.all([
      prisma.user.create({
        data: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          password: customerPassword,
          role: 'customer',
          phone: '+1-555-2001',
          address: '123 Oak Street, City, State 12345',
          accountStatus: 'verified',
        }
      }),
      prisma.user.create({
        data: {
          name: 'Maria Garcia',
          email: 'maria.garcia@email.com',
          password: customerPassword,
          role: 'customer',
          phone: '+1-555-2002',
          address: '456 Pine Avenue, City, State 12345',
          accountStatus: 'verified',
        }
      }),
      prisma.user.create({
        data: {
          name: 'David Wilson',
          email: 'david.wilson@email.com',
          password: customerPassword,
          role: 'customer',
          phone: '+1-555-2003',
          address: '789 Elm Drive, City, State 12345',
          accountStatus: 'verified',
        }
      }),
      prisma.user.create({
        data: {
          name: 'Lisa Anderson',
          email: 'lisa.anderson@email.com',
          password: customerPassword,
          role: 'customer',
          phone: '+1-555-2004',
          address: '321 Maple Lane, City, State 12345',
          accountStatus: 'verified',
        }
      }),
      prisma.user.create({
        data: {
          name: 'Robert Taylor',
          email: 'robert.taylor@email.com',
          password: customerPassword,
          role: 'customer',
          phone: '+1-555-2005',
          address: '654 Cedar Court, City, State 12345',
          accountStatus: 'verified',
        }
      })
    ]);

    console.log('✅ Customer users created');

    // Create Sample Prescriptions
    console.log('💊 Creating sample prescriptions...');
    
    // Create Staff records first
    const staff1 = await prisma.staff.create({
      data: {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.staff@globalpt.com',
        address: '789 Pharmacy Lane, City, State 12345',
        phone: '+1-555-1001',
      }
    });

    const staff2 = await prisma.staff.create({
      data: {
        name: 'Dr. Michael Chen',
        email: 'michael.staff@globalpt.com',
        address: '321 Medical Drive, City, State 12345',
        phone: '+1-555-1002',
      }
    });

    const prescriptions = await Promise.all([
      prisma.prescription.create({
        data: {
          userId: customers[0].id,
          staffId: staff1.id,
          medicine: 'Amoxicillin 500mg',
          dosage: '500mg twice daily',
          instructions: 'Take with food. Complete full course.',
          quantity: 30,
          medicineType: 'POM',
          requiresPrescription: true,
          prescribedBy: 'Dr. James Miller',
          amount: 45.99,
          deliveryAddress: customers[0].address,
          status: 'delivered',
          paymentStatus: 'paid',
          capacityConfirmed: true,
          riskAssessmentComplete: true,
          prescriptionValidated: true,
          paidAt: new Date('2024-07-01'),
        }
      }),
      prisma.prescription.create({
        data: {
          userId: customers[1].id,
          staffId: staff2.id,
          medicine: 'Lisinopril 10mg',
          dosage: '10mg once daily',
          instructions: 'Take in the morning. Monitor blood pressure.',
          quantity: 30,
          medicineType: 'POM',
          requiresPrescription: true,
          prescribedBy: 'Dr. Jennifer Brown',
          amount: 32.50,
          deliveryAddress: customers[1].address,
          status: 'ready_to_ship',
          paymentStatus: 'paid',
          capacityConfirmed: true,
          riskAssessmentComplete: true,
          prescriptionValidated: true,
          paidAt: new Date('2024-07-05'),
        }
      }),
      prisma.prescription.create({
        data: {
          userId: customers[2].id,
          staffId: staff1.id,
          medicine: 'Metformin 850mg',
          dosage: '850mg twice daily',
          instructions: 'Take with meals. Monitor blood sugar.',
          quantity: 60,
          medicineType: 'POM',
          requiresPrescription: true,
          prescribedBy: 'Dr. William Davis',
          amount: 28.75,
          deliveryAddress: customers[2].address,
          status: 'pending',
          paymentStatus: 'unpaid',
          capacityConfirmed: false,
          riskAssessmentComplete: false,
          prescriptionValidated: false,
        }
      })
    ]);

    console.log('✅ Sample prescriptions created');

    // Create Sample Orders
    console.log('🛒 Creating sample orders...');
    await Promise.all([
      prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-001',
          userId: customers[0].id,
          prescriptionId: prescriptions[0].id,
          totalAmount: 45.99,
          deliveryAddress: customers[0].address,
          deliveryMethod: 'express',
          status: 'delivered',
          courierName: 'FedEx Express',
          trackingNumber: 'FX123456789',
          paidAt: new Date('2024-07-01'),
          dispatchedAt: new Date('2024-07-01'),
          deliveredAt: new Date('2024-07-02'),
        }
      }),
      prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-002',
          userId: customers[1].id,
          prescriptionId: prescriptions[1].id,
          totalAmount: 32.50,
          deliveryAddress: customers[1].address,
          deliveryMethod: 'standard',
          status: 'dispatched',
          courierName: 'UPS Ground',
          trackingNumber: 'UPS987654321',
          paidAt: new Date('2024-07-05'),
          dispatchedAt: new Date('2024-07-06'),
        }
      }),
      prisma.order.create({
        data: {
          orderNumber: 'ORD-2024-003',
          userId: customers[2].id,
          prescriptionId: prescriptions[2].id,
          totalAmount: 28.75,
          deliveryAddress: customers[2].address,
          deliveryMethod: 'standard',
          status: 'confirmed',
        }
      })
    ]);

    console.log('✅ Sample orders created');

    // Create Sample Complaints
    console.log('📝 Creating sample complaints...');
    await Promise.all([
      prisma.complaint.create({
        data: {
          userId: customers[3].id,
          title: 'Delayed Prescription Delivery',
          description: 'My prescription was supposed to arrive yesterday but I have not received it yet.',
          category: 'delivery',
          priority: 'high',
          status: 'investigating',
          assignedToId: assistant1.id,
          assignedAt: new Date(),
        }
      }),
      prisma.complaint.create({
        data: {
          userId: customers[4].id,
          title: 'Incorrect Medication Received',
          description: 'I received the wrong medication in my order. Please help resolve this issue.',
          category: 'product',
          priority: 'urgent',
          status: 'investigating',
          assignedToId: pharmacist1.id,
          assignedAt: new Date(),
        }
      })
    ]);

    console.log('✅ Sample complaints created');

    // Final verification
    const userCount = await prisma.user.count();
    const staffCount = await prisma.staff.count();
    const prescriptionCount = await prisma.prescription.count();
    const orderCount = await prisma.order.count();
    const complaintCount = await prisma.complaint.count();
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    const verifiedCount = await prisma.user.count({ where: { accountStatus: 'verified' } });

    console.log('\n🎉 Production database seeding completed successfully!');
    console.log('📊 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Staff: ${staffCount}`);
    console.log(`   Prescriptions: ${prescriptionCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Complaints: ${complaintCount}`);
    console.log(`   Admin Users: ${adminCount}`);
    console.log(`   Verified Users: ${verifiedCount}`);
    
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('ADMIN ACCOUNTS:');
    console.log('Email: admin@globalpt.com');
    console.log('Password: Admin@123');
    console.log('Email: superadmin@globalpt.com');
    console.log('Password: Admin@123');
    console.log('\nSTAFF ACCOUNTS:');
    console.log('Email: sarah.pharmacist@globalpt.com');
    console.log('Password: Staff@123');
    console.log('Email: michael.pharmacist@globalpt.com');
    console.log('Password: Staff@123');
    console.log('Email: emily.assistant@globalpt.com');
    console.log('Password: Staff@123');
    console.log('\nCUSTOMER ACCOUNTS:');
    console.log('Email: john.smith@email.com');
    console.log('Password: Customer@123');
    console.log('Email: maria.garcia@email.com');
    console.log('Password: Customer@123');
    console.log('Email: david.wilson@email.com');
    console.log('Password: Customer@123');
    console.log('Email: lisa.anderson@email.com');
    console.log('Password: Customer@123');
    console.log('Email: robert.taylor@email.com');
    console.log('Password: Customer@123');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
