const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createStaffRecords() {
  try {
    console.log('👥 Creating Staff records for users with staff role...\n');

    // Get all users with staff role
    const staffUsers = await prisma.user.findMany({
      where: { role: 'staff' }
    });

    console.log(`Found ${staffUsers.length} users with staff role`);

    // Check existing staff records
    const existingStaff = await prisma.staff.findMany();
    const existingEmails = existingStaff.map(s => s.email);
    
    console.log(`Existing staff records: ${existingStaff.length}`);

    // Create staff records for users that don't have them
    let createdCount = 0;
    for (const user of staffUsers) {
      if (!existingEmails.includes(user.email)) {
        const staffRecord = await prisma.staff.create({
          data: {
            name: user.name,
            email: user.email,
            address: user.address,
            phone: null // Users don't have phone numbers in our schema
          }
        });
        
        console.log(`✅ Created staff record for ${user.name} (${user.email}) - ID: ${staffRecord.id}`);
        createdCount++;
      } else {
        console.log(`⚪ Staff record already exists for ${user.name} (${user.email})`);
      }
    }

    console.log(`\n🎉 Created ${createdCount} new staff records!`);

    // Now show all staff records
    const allStaff = await prisma.staff.findMany();
    console.log(`\n📋 All Staff Records (${allStaff.length} total):`);
    allStaff.forEach(staff => {
      console.log(`  - ID: ${staff.id}, Name: ${staff.name}, Email: ${staff.email}`);
    });

  } catch (error) {
    console.error('❌ Error creating staff records:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStaffRecords();
