const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed Permissions
  const permissionsData = [
    { name: 'manage_users' },
    { name: 'manage_staff' },
    { name: 'manage_customers' },
    { name: 'manage_prescriptions' },
    { name: 'manage_complaints' },
    { name: 'view_dashboard' },
    { name: 'place_order' },
    { name: 'view_orders' },
  ];
  await prisma.permission.createMany({ data: permissionsData, skipDuplicates: true });

  // Seed Roles
  const rolesData = [
    { name: 'admin' },
    { name: 'staff' },
    { name: 'customer' },
    { name: 'assistant' },
  ];
  await prisma.role.createMany({ data: rolesData, skipDuplicates: true });

  // Fetch all permissions and roles
  const allPermissions = await prisma.permission.findMany();
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const staffRole = await prisma.role.findUnique({ where: { name: 'staff' } });
  const customerRole = await prisma.role.findUnique({ where: { name: 'customer' } });
  const assistantRole = await prisma.role.findUnique({ where: { name: 'assistant' } });

  // Assign permissions to roles
  await prisma.role.update({
    where: { id: adminRole.id },
    data: { permissions: { set: allPermissions.map(p => ({ id: p.id })) } },
  });
  const staffPermissions = allPermissions.filter(p =>
    ['manage_prescriptions', 'manage_complaints', 'view_dashboard'].includes(p.name)
  );
  await prisma.role.update({
    where: { id: staffRole.id },
    data: { permissions: { set: staffPermissions.map(p => ({ id: p.id })) } },
  });
  const customerPermissions = allPermissions.filter(p =>
    ['place_order', 'view_orders', 'view_dashboard'].includes(p.name)
  );
  await prisma.role.update({
    where: { id: customerRole.id },
    data: { permissions: { set: customerPermissions.map(p => ({ id: p.id })) } },
  });
  const assistantPermissions = allPermissions.filter(p =>
    ['view_dashboard'].includes(p.name)
  );
  await prisma.role.update({
    where: { id: assistantRole.id },
    data: { permissions: { set: assistantPermissions.map(p => ({ id: p.id })) } },
  });

  // Seed Users
  await prisma.user.createMany({
    data: [
      {
        name: 'Admin User',
        email: 'admin@pharmacy.com',
        password: 'admin123',
        address: '123 Admin St',
        roleId: adminRole.id,
      },
      {
        name: 'Staff User',
        email: 'staff@pharmacy.com',
        password: 'staff123',
        address: '456 Staff Ave',
        roleId: staffRole.id,
      },
      {
        name: 'Customer User',
        email: 'customer@pharmacy.com',
        password: 'customer123',
        address: '789 Customer Rd',
        roleId: customerRole.id,
      },
      {
        name: 'Assistant User',
        email: 'assistant@pharmacy.com',
        password: 'assistant123',
        address: '321 Assistant Blvd',
        roleId: assistantRole.id,
      },
    ],
    skipDuplicates: true,
  });

  // Seed Staff
  await prisma.staff.createMany({
    data: [
      {
        name: 'Staff User',
        email: 'staff@pharmacy.com',
        address: '456 Staff Ave',
        phone: '1234567890',
      },
    ],
    skipDuplicates: true,
  });

  // Seed Customers
  await prisma.customer.createMany({
    data: [
      {
        name: 'Customer User',
        email: 'customer@pharmacy.com',
        address: '789 Customer Rd',
        phone: '0987654321',
      },
    ],
    skipDuplicates: true,
  });

  // Seed Prescription
  const user = await prisma.user.findUnique({ where: { email: 'customer@pharmacy.com' } });
  const staff = await prisma.staff.findFirst();

  await prisma.prescription.create({
    data: {
      userId: user.id,
      staffId: staff.id,
      medicine: 'Amoxicillin',
      amount: 2,
      deliveryAddress: user.address,
      status: 'pending',
      paymentStatus: 'unpaid',
    },
  });

  // Seed Complaint
  await prisma.complaint.create({
    data: {
      userId: user.id,
      message: 'Late delivery',
      status: 'pending',
    },
  });

  console.log('Seed complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });