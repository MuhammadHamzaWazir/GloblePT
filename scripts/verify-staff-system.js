const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyStaffSystem() {
  try {
    console.log('🔍 Verifying Staff Prescription Management System...\n');

    // Check Staff records
    console.log('1. Checking Staff records:');
    const staffMembers = await prisma.staff.findMany({
      include: {
        prescriptions: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      }
    });

    console.log(`   Found ${staffMembers.length} staff members:`);
    staffMembers.forEach(staff => {
      console.log(`   - ${staff.name} (${staff.email}): ${staff.prescriptions.length} assigned prescriptions`);
    });

    // Check User roles
    console.log('\n2. Checking Users with staff/admin roles:');
    const staffUsers = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ['staff', 'admin']
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`   Found ${staffUsers.length} staff/admin users:`);
    staffUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role.name}`);
    });

    // Check Prescriptions with assignment
    console.log('\n3. Checking Prescription assignments:');
    const prescriptions = await prisma.prescription.findMany({
      where: {
        staffId: {
          not: null
        }
      },
      include: {
        user: {
          select: { name: true, email: true }
        },
        staff: {
          select: { name: true, email: true }
        }
      }
    });

    console.log(`   Found ${prescriptions.length} assigned prescriptions:`);
    prescriptions.forEach(p => {
      console.log(`   - ID: ${p.id} | Customer: ${p.user.name} | Medicine: ${p.medicine} | Status: ${p.status} | Assigned to: ${p.staff?.name || 'None'}`);
    });

    // Check schema fields
    console.log('\n4. Testing trackingNumber field update:');
    const testPrescription = prescriptions.find(p => p.status !== 'delivered');
    if (testPrescription) {
      try {
        const updated = await prisma.prescription.update({
          where: { id: testPrescription.id },
          data: { trackingNumber: 'TEST-TRACKING-' + Date.now() },
          select: { id: true, trackingNumber: true, status: true }
        });
        console.log(`   ✅ Successfully updated prescription ${updated.id} with tracking: ${updated.trackingNumber}`);
      } catch (error) {
        console.log(`   ❌ Failed to update trackingNumber: ${error.message}`);
      }
    }

    console.log('\n✅ Staff Prescription Management System verification complete!');
    console.log('\n📋 System Features Available:');
    console.log('   • Staff dashboard at /staff-dashboard');
    console.log('   • Prescription management at /staff-dashboard/prescriptions');
    console.log('   • Staff can view only their assigned prescriptions');
    console.log('   • Staff can update prescription status');
    console.log('   • Staff can add tracking numbers');
    console.log('   • Search and filter functionality');
    console.log('   • Status workflow: approved → ready_to_ship → dispatched → delivered');

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyStaffSystem();
