const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignPrescriptionsToStaff() {
  try {
    console.log('👥 Assigning prescriptions to staff members...\n');

    // Get staff members from Staff table
    const staffMembers = await prisma.staff.findMany();

    if (staffMembers.length === 0) {
      throw new Error('No staff members found');
    }

    console.log(`Found ${staffMembers.length} staff members:`);
    staffMembers.forEach(staff => {
      console.log(`  - ${staff.name} (${staff.email})`);
    });

    // Get unassigned prescriptions (those with staffId = null)
    const unassignedPrescriptions = await prisma.prescription.findMany({
      where: { staffId: null },
      include: { user: true }
    });

    if (unassignedPrescriptions.length === 0) {
      console.log('\n✅ All prescriptions are already assigned to staff');
      return;
    }

    console.log(`\nFound ${unassignedPrescriptions.length} unassigned prescriptions to distribute\n`);

    // Assign prescriptions to staff members in a round-robin fashion
    let assignmentCount = 0;
    for (let i = 0; i < unassignedPrescriptions.length; i++) {
      const prescription = unassignedPrescriptions[i];
      const staffMember = staffMembers[i % staffMembers.length]; // Round-robin assignment

      await prisma.prescription.update({
        where: { id: prescription.id },
        data: { staffId: staffMember.id }
      });

      console.log(`✅ Assigned prescription #${prescription.id} (${prescription.medicine}) from ${prescription.user.name} to ${staffMember.name}`);
      assignmentCount++;
    }

    console.log(`\n🎉 Successfully assigned ${assignmentCount} prescriptions to staff members!`);

    // Show assignment summary
    console.log('\n📊 Assignment Summary:');
    for (const staff of staffMembers) {
      const assignedCount = await prisma.prescription.count({
        where: { staffId: staff.id }
      });
      console.log(`   ${staff.name}: ${assignedCount} prescriptions`);
    }

    // Show status distribution
    console.log('\n📋 Status Distribution:');
    const statusCounts = await prisma.prescription.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    statusCounts.forEach(item => {
      console.log(`   ${item.status}: ${item._count.status} prescriptions`);
    });

  } catch (error) {
    console.error('❌ Error assigning prescriptions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignPrescriptionsToStaff();
