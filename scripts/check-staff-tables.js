const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStaffTables() {
  try {
    console.log('🔍 Checking Staff and User tables...\n');

    // Check Staff table
    const staffRecords = await prisma.staff.findMany();
    console.log(`Staff table has ${staffRecords.length} records:`);
    staffRecords.forEach(staff => {
      console.log(`  - ${staff.name} (${staff.email})`);
    });

    console.log('\n');

    // Check Users with staff role
    const staffUsers = await prisma.user.findMany({
      where: { role: { name: 'staff' } },
      include: { role: true }
    });
    console.log(`Users with staff role: ${staffUsers.length} records:`);
    staffUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });

    console.log('\n');

    // Check current prescriptions assignment
    const prescriptions = await prisma.prescription.findMany({
      include: { user: true, staff: true }
    });
    console.log(`Total prescriptions: ${prescriptions.length}`);
    console.log('Assignment status:');
    const assigned = prescriptions.filter(p => p.staffId !== null).length;
    const unassigned = prescriptions.filter(p => p.staffId === null).length;
    console.log(`  - Assigned to staff: ${assigned}`);
    console.log(`  - Unassigned: ${unassigned}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaffTables();
