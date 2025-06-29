import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// This endpoint should only be used ONCE for initial data seeding on GoDaddy
// After running once, it will disable itself for security

export async function GET() {
  try {
    // Check if already seeded
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      return NextResponse.json({ 
        message: "Database already seeded. This endpoint is disabled for security.",
        seeded: true,
        userCount: existingUsers
      }, { status: 200 });
    }

    console.log('🌱 Starting production database seeding via API...');

    // 1. Seed Permissions
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
    
    await prisma.permission.createMany({ data: permissionsData, skipDuplicates: true });

    // 2. Seed Roles
    const rolesData = [
      { name: 'admin' },
      { name: 'staff' },
      { name: 'customer' },
      { name: 'assistant' },
      { name: 'supervisor' },
    ];
    
    await prisma.role.createMany({ data: rolesData, skipDuplicates: true });

    // 3. Get roles and permissions for assignment
    const allPermissions = await prisma.permission.findMany();
    const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
    const staffRole = await prisma.role.findUnique({ where: { name: 'staff' } });
    const customerRole = await prisma.role.findUnique({ where: { name: 'customer' } });
    const assistantRole = await prisma.role.findUnique({ where: { name: 'assistant' } });
    const supervisorRole = await prisma.role.findUnique({ where: { name: 'supervisor' } });

    // Assign permissions to roles
    await prisma.role.update({
      where: { id: adminRole!.id },
      data: { permissions: { set: allPermissions.map(p => ({ id: p.id })) } },
    });

    const staffPermissions = allPermissions.filter(p =>
      ['manage_prescriptions', 'manage_complaints', 'view_dashboard', 'view_orders', 'send_emails'].includes(p.name)
    );
    await prisma.role.update({
      where: { id: staffRole!.id },
      data: { permissions: { set: staffPermissions.map(p => ({ id: p.id })) } },
    });

    const supervisorPermissions = allPermissions.filter(p =>
      ['manage_prescriptions', 'manage_complaints', 'view_dashboard', 'view_orders', 'send_emails', 'approve_prescriptions', 'view_reports'].includes(p.name)
    );
    await prisma.role.update({
      where: { id: supervisorRole!.id },
      data: { permissions: { set: supervisorPermissions.map(p => ({ id: p.id })) } },
    });

    const customerPermissions = allPermissions.filter(p =>
      ['place_order', 'view_orders', 'view_dashboard'].includes(p.name)
    );
    await prisma.role.update({
      where: { id: customerRole!.id },
      data: { permissions: { set: customerPermissions.map(p => ({ id: p.id })) } },
    });

    const assistantPermissions = allPermissions.filter(p =>
      ['view_dashboard', 'view_orders'].includes(p.name)
    );
    await prisma.role.update({
      where: { id: assistantRole!.id },
      data: { permissions: { set: assistantPermissions.map(p => ({ id: p.id })) } },
    });

    // 4. Seed Users with hashed passwords
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
        roleId: adminRole!.id,
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
        roleId: supervisorRole!.id,
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
          roleId: staffRole!.id,
          supervisorId: supervisorUser.id,
        },
      });
      staffUsers.push(user);
    }

    // Create customer users
    const customerUsers = [];
    const customerData = [
      { name: 'Alice Smith', email: 'alice.smith@gmail.com', address: '101 Customer St, Customer City, CC 12345', ni: 'NI901234I', nhs: 'NHS9012345678' },
      { name: 'Bob Johnson', email: 'bob.johnson@gmail.com', address: '202 Client Ave, Client City, CL 12345', ni: 'NI012345J', nhs: 'NHS0123456789' },
      { name: 'Carol Williams', email: 'carol.williams@yahoo.com', address: '303 Patient Rd, Patient City, PT 12345', ni: 'NI123456K', nhs: 'NHS1234567890' },
      { name: 'Daniel Davis', email: 'daniel.davis@hotmail.com', address: '404 Buyer Blvd, Buyer City, BC 12345', ni: 'NI234567L', nhs: 'NHS2345678901' },
      { name: 'Eva Martinez', email: 'eva.martinez@gmail.com', address: '505 Consumer Way, Consumer City, CO 12345', ni: 'NI345678M', nhs: 'NHS3456789012' },
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
          roleId: customerRole!.id,
        },
      });
      customerUsers.push(user);
    }

    // 5. Seed Staff records
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

    // 6. Seed Customer records
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

    // 7. Seed Prescriptions
    const medicines = [
      'Amoxicillin 500mg', 'Paracetamol 500mg', 'Ibuprofen 200mg', 'Aspirin 75mg',
      'Omeprazole 20mg', 'Simvastatin 40mg', 'Metformin 500mg', 'Amlodipine 5mg',
    ];
    
    const statuses = ['pending', 'approved', 'dispensed', 'completed'];
    const paymentStatuses = ['unpaid', 'paid'];
    const staff = await prisma.staff.findMany();

    for (let i = 0; i < 20; i++) {
      const randomCustomer = customerUsers[Math.floor(Math.random() * customerUsers.length)];
      const randomMedicine = medicines[Math.floor(Math.random() * medicines.length)];
      const randomStaff = staff[Math.floor(Math.random() * staff.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomPaymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      const randomQuantity = Math.floor(Math.random() * 3) + 1;
      const randomAmount = (Math.random() * 50 + 10).toFixed(2);

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
          prescriptionText: `Prescription for ${randomMedicine} - ${randomQuantity} units`,
          dosage: '1 tablet',
          instructions: 'Take as directed by physician',
        },
      });
    }

    // 8. Seed Complaints
    const complaintMessages = [
      'Late delivery of my prescription',
      'Wrong medication received',
      'Poor customer service experience',
      'Damaged packaging on delivery',
      'Missing items from my order',
    ];
    
    const complaintStatuses = ['received', 'investigating', 'resolved'];

    for (let i = 0; i < 10; i++) {
      const randomCustomer = customerUsers[Math.floor(Math.random() * customerUsers.length)];
      const randomMessage = complaintMessages[Math.floor(Math.random() * complaintMessages.length)];
      const randomStatus = complaintStatuses[Math.floor(Math.random() * complaintStatuses.length)];

      await prisma.complaint.create({
        data: {
          userId: randomCustomer.id,
          title: 'Customer Service Issue',
          description: randomMessage,
          category: ['service', 'product', 'delivery'][Math.floor(Math.random() * 3)],
          priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          status: randomStatus,
        },
      });
    }

    return NextResponse.json({
      message: "🎉 Database seeded successfully!",
      summary: {
        permissions: permissionsData.length,
        roles: rolesData.length,
        users: 1 + 1 + staffUsers.length + customerUsers.length,
        staff: allStaffUsers.length,
        customers: customerUsers.length,
        prescriptions: 20,
        complaints: 10
      },
      credentials: {
        admin: "admin@pharmacy.com / password123",
        supervisor: "supervisor@pharmacy.com / password123",
        staff: "sarah.johnson@pharmacy.com / password123",
        customer: "alice.smith@gmail.com / password123"
      },
      note: "This endpoint is now disabled for security. Delete this API route after seeding."
    }, { status: 200 });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      message: "Seeding failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
