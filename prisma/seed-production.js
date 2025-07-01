const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Set the Railway production database URL
process.env.DATABASE_URL = "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway";

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');
  
  try {
    // Clear existing data in correct order to avoid foreign key constraints
    console.log('🧹 Cleaning existing data...');
    await prisma.complaint.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.permission.deleteMany({});
    
    console.log('✅ Existing data cleaned');

    // 1. Seed Permissions
    console.log('🔐 Seeding permissions...');
    const permissionsData = [
      { name: 'manage_users' },
      { name: 'manage_staff' },
      { name: 'manage_customers' },
      { name: 'manage_prescriptions' },
      { name: 'manage_complaints' },
      { name: 'view_dashboard' },
      { name: 'place_order' },
      { name: 'view_orders' },
      { name: 'approve_prescriptions' },
      { name: 'manage_payments' },
      { name: 'send_emails' },
      { name: 'view_reports' },
    ];
    
    for (const permission of permissionsData) {
      await prisma.permission.create({ data: permission });
    }
    console.log(`✅ Created ${permissionsData.length} permissions`);

    // 2. Seed Roles
    console.log('👥 Seeding roles...');
    const rolesData = [
      { name: 'admin' },
      { name: 'staff' },
      { name: 'customer' },
      { name: 'assistant' },
      { name: 'supervisor' },
    ];
    
    for (const role of rolesData) {
      await prisma.role.create({ data: role });
    }
    console.log(`✅ Created ${rolesData.length} roles`);

    // 3. Assign permissions to roles
    console.log('🔗 Assigning permissions to roles...');
    const allPermissions = await prisma.permission.findMany();
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const staffRole = await prisma.role.findUnique({ where: { name: 'staff' } });
    const customerRole = await prisma.role.findUnique({ where: { name: 'customer' } });
    const assistantRole = await prisma.role.findUnique({ where: { name: 'assistant' } });
    const supervisorRole = await prisma.role.findUnique({ where: { name: 'supervisor' } });

    // Admin gets all permissions
    await prisma.role.update({
      where: { id: adminRole.id },
      data: { permissions: { set: allPermissions.map(p => ({ id: p.id })) } },
    });

    // Staff permissions
    const staffPermissions = allPermissions.filter(p =>
      ['manage_prescriptions', 'manage_complaints', 'view_dashboard', 'view_orders', 'send_emails'].includes(p.name)
    );
    await prisma.role.update({
      where: { id: staffRole.id },
      data: { permissions: { set: staffPermissions.map(p => ({ id: p.id })) } },
    });

    // Supervisor permissions (more than staff)
    const supervisorPermissions = allPermissions.filter(p =>
      ['manage_prescriptions', 'manage_complaints', 'view_dashboard', 'view_orders', 'send_emails', 'approve_prescriptions', 'view_reports'].includes(p.name)
    );
    await prisma.role.update({
      where: { id: supervisorRole.id },
      data: { permissions: { set: supervisorPermissions.map(p => ({ id: p.id })) } },
    });

    // Customer permissions
    const customerPermissions = allPermissions.filter(p =>
      ['place_order', 'view_orders', 'view_dashboard'].includes(p.name)
    );
    await prisma.role.update({
      where: { id: customerRole.id },
      data: { permissions: { set: customerPermissions.map(p => ({ id: p.id })) } },
    });

    // Assistant permissions
    const assistantPermissions = allPermissions.filter(p =>
      ['view_dashboard', 'view_orders'].includes(p.name)
    );
    await prisma.role.update({
      where: { id: assistantRole.id },
      data: { permissions: { set: assistantPermissions.map(p => ({ id: p.id })) } },
    });

    console.log('✅ Permissions assigned to roles');

    // 4. Seed Users with hashed passwords
    console.log('👤 Seeding users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@pharmacy.com',
        password: hashedPassword,
        address: '123 Admin Street, Admin City, AC 12345',
        nationalInsuranceNumber: 'NI123456A',
        nhsNumber: 'NHS1234567890',
        roleId: adminRole.id,
      },
    });

    // Create supervisor user
    const supervisorUser = await prisma.user.create({
      data: {
        name: 'John Supervisor',
        email: 'supervisor@pharmacy.com',
        password: hashedPassword,
        address: '456 Supervisor Ave, Supervisor City, SC 12345',
        nationalInsuranceNumber: 'NI234567B',
        nhsNumber: 'NHS2345678901',
        roleId: supervisorRole.id,
      },
    });

    // Create staff users
    const staffUsers = [];
    const staffData = [
      { name: 'Sarah Johnson', email: 'sarah.johnson@pharmacy.com', address: '789 Staff St, Staff City, ST 12345', ni: 'NI345678C', nhs: 'NHS3456789012' },
      { name: 'Mike Wilson', email: 'mike.wilson@pharmacy.com', address: '321 Pharmacist Rd, Pharma City, PC 12345', ni: 'NI456789D', nhs: 'NHS4567890123' },
      { name: 'Emma Davis', email: 'emma.davis@pharmacy.com', address: '654 Medicine Blvd, Med City, MC 12345', ni: 'NI567890E', nhs: 'NHS5678901234' },
      { name: 'David Brown', email: 'david.brown@pharmacy.com', address: '987 Prescription Way, Rx City, RC 12345', ni: 'NI678901F', nhs: 'NHS6789012345' },
    ];

    for (const staff of staffData) {
      const user = await prisma.user.create({
        data: {
          name: staff.name,
          email: staff.email,
          password: hashedPassword,
          address: staff.address,
          nationalInsuranceNumber: staff.ni,
          nhsNumber: staff.nhs,
          roleId: staffRole.id,
          supervisorId: supervisorUser.id,
        },
      });
      staffUsers.push(user);
    }

    // Create assistant users
    const assistantUsers = [];
    const assistantData = [
      { name: 'Lisa Chen', email: 'lisa.chen@pharmacy.com', address: '147 Assistant Ave, Assist City, AC 12345', ni: 'NI789012G', nhs: 'NHS7890123456' },
      { name: 'Tom Anderson', email: 'tom.anderson@pharmacy.com', address: '258 Helper St, Help City, HC 12345', ni: 'NI890123H', nhs: 'NHS8901234567' },
    ];

    for (const assistant of assistantData) {
      const user = await prisma.user.create({
        data: {
          name: assistant.name,
          email: assistant.email,
          password: hashedPassword,
          address: assistant.address,
          nationalInsuranceNumber: assistant.ni,
          nhsNumber: assistant.nhs,
          roleId: assistantRole.id,
          supervisorId: supervisorUser.id,
        },
      });
      assistantUsers.push(user);
    }

    // Create customer users
    const customerUsers = [];
    const customerData = [
      { name: 'Alice Smith', email: 'alice.smith@gmail.com', address: '101 Customer St, Customer City, CC 12345', ni: 'NI901234I', nhs: 'NHS9012345678' },
      { name: 'Bob Johnson', email: 'bob.johnson@gmail.com', address: '202 Client Ave, Client City, CL 12345', ni: 'NI012345J', nhs: 'NHS0123456789' },
      { name: 'Carol Williams', email: 'carol.williams@yahoo.com', address: '303 Patient Rd, Patient City, PT 12345', ni: 'NI123456K', nhs: 'NHS1234567890' },
      { name: 'Daniel Davis', email: 'daniel.davis@hotmail.com', address: '404 Buyer Blvd, Buyer City, BC 12345', ni: 'NI234567L', nhs: 'NHS2345678901' },
      { name: 'Eva Martinez', email: 'eva.martinez@gmail.com', address: '505 Consumer Way, Consumer City, CO 12345', ni: 'NI345678M', nhs: 'NHS3456789012' },
      { name: 'Frank Wilson', email: 'frank.wilson@gmail.com', address: '606 Purchaser St, Purchase City, PC 12345', ni: 'NI456789N', nhs: 'NHS4567890123' },
    ];

    for (const customer of customerData) {
      const user = await prisma.user.create({
        data: {
          name: customer.name,
          email: customer.email,
          password: hashedPassword,
          address: customer.address,
          nationalInsuranceNumber: customer.ni,
          nhsNumber: customer.nhs,
          roleId: customerRole.id,
        },
      });
      customerUsers.push(user);
    }

    console.log(`✅ Created ${1 + 1 + staffUsers.length + assistantUsers.length + customerUsers.length} users`);

    // 5. Seed Staff records
    console.log('👨‍⚕️ Seeding staff records...');
    const allStaffUsers = [supervisorUser, ...staffUsers];
    for (const user of allStaffUsers) {
      await prisma.staff.create({
        data: {
          name: user.name,
          email: user.email,
          address: user.address,
          phone: `+44${Math.floor(Math.random() * 1000000000)}`,
        },
      });
    }
    console.log(`✅ Created ${allStaffUsers.length} staff records`);

    // 6. Seed Customer records
    console.log('👥 Seeding customer records...');
    for (const user of customerUsers) {
      await prisma.customer.create({
        data: {
          name: user.name,
          email: user.email,
          address: user.address,
          phone: `+44${Math.floor(Math.random() * 1000000000)}`,
        },
      });
    }
    console.log(`✅ Created ${customerUsers.length} customer records`);

    // 7. Seed Prescriptions
    console.log('💊 Seeding prescriptions...');
    const medicines = [
      'Amoxicillin 500mg', 'Paracetamol 500mg', 'Ibuprofen 200mg', 'Aspirin 75mg',
      'Omeprazole 20mg', 'Simvastatin 40mg', 'Metformin 500mg', 'Amlodipine 5mg',
      'Atorvastatin 20mg', 'Lansoprazole 30mg', 'Ramipril 5mg', 'Bendroflumethiazide 2.5mg',
      'Levothyroxine 100mcg', 'Salbutamol 100mcg', 'Clopidogrel 75mg', 'Warfarin 5mg'
    ];
    
    const statuses = ['pending', 'approved', 'dispensed', 'completed', 'cancelled'];
    const paymentStatuses = ['unpaid', 'paid', 'refunded'];
    const staff = await prisma.staff.findMany();

    for (let i = 0; i < 50; i++) {
      const randomCustomer = customerUsers[Math.floor(Math.random() * customerUsers.length)];
      const randomMedicine = medicines[Math.floor(Math.random() * medicines.length)];
      const randomStaff = staff[Math.floor(Math.random() * staff.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomPaymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const randomQuantity = Math.floor(Math.random() * 5) + 1;
      const randomAmount = (Math.random() * 100 + 10).toFixed(2);

      await prisma.prescription.create({
        data: {
          userId: randomCustomer.id,
          staffId: randomStaff.id,
          medicine: randomMedicine,
          quantity: randomQuantity,
          amount: parseFloat(randomAmount),
          deliveryAddress: randomCustomer.address,
          status: randomStatus,
          paymentStatus: randomPaymentStatus,
          approvedBy: randomStatus === 'approved' ? supervisorUser.id : null,
          prescriptionText: `Prescription for ${randomMedicine} - ${randomQuantity} units`,
          dosage: '1 tablet',
          instructions: 'Take as directed by physician',
        },
      });
    }
    console.log('✅ Created 50 prescription records');

    // 8. Seed Complaints
    console.log('📝 Seeding complaints...');
    const complaintMessages = [
      'Late delivery of my prescription',
      'Wrong medication received',
      'Poor customer service experience',
      'Damaged packaging on delivery',
      'Missing items from my order',
      'Billing error on my account',
      'Difficulty contacting pharmacy staff',
      'Website technical issues',
      'Prescription not ready on time',
      'Quality issue with medication',
      'Delivery address was incorrect',
      'Long waiting time for service',
      'Prescription dosage concerns',
      'Insurance coverage problems',
      'Refund request processing delay'
    ];
    
    const complaintStatuses = ['pending', 'in_progress', 'resolved', 'closed'];

    for (let i = 0; i < 30; i++) {
      const randomCustomer = customerUsers[Math.floor(Math.random() * customerUsers.length)];
      const randomMessage = complaintMessages[Math.floor(Math.random() * complaintMessages.length)];
      const randomStatus = complaintStatuses[Math.floor(Math.random() * complaintStatuses.length)];
      const randomStaff = staff[Math.floor(Math.random() * staff.length)];
      const randomStaffUser = allStaffUsers[Math.floor(Math.random() * allStaffUsers.length)];

      await prisma.complaint.create({
        data: {
          userId: randomCustomer.id,
          title: 'Customer Service Issue',
          description: randomMessage,
          category: ['service', 'staff', 'product', 'delivery', 'billing'][Math.floor(Math.random() * 5)],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          status: randomStatus === 'pending' ? 'received' : randomStatus === 'in_progress' ? 'investigating' : randomStatus,
          assignedToId: Math.random() > 0.3 ? randomStaff.id : null,
          assignedById: Math.random() > 0.3 ? supervisorUser.id : null,
          resolvedById: randomStatus === 'resolved' ? randomStaffUser.id : null,
          resolution: randomStatus === 'resolved' ? 'Issue has been resolved. Thank you for your patience.' : null,
        },
      });
    }
    console.log('✅ Created 30 complaint records');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Permissions: ${permissionsData.length}`);
    console.log(`- Roles: ${rolesData.length}`);
    console.log(`- Users: ${1 + 1 + staffUsers.length + assistantUsers.length + customerUsers.length}`);
    console.log(`- Staff: ${allStaffUsers.length}`);
    console.log(`- Customers: ${customerUsers.length}`);
    console.log('- Prescriptions: 50');
    console.log('- Complaints: 30');
    console.log('\n🔑 Default Login Credentials:');
    console.log('Admin: admin@pharmacy.com / password123');
    console.log('Supervisor: supervisor@pharmacy.com / password123');
    console.log('Staff: sarah.johnson@pharmacy.com / password123');
    console.log('Customer: alice.smith@gmail.com / password123');

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
