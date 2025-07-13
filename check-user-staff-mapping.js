const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserStaffMapping() {
  try {
    // Get users with staff role
    const users = await prisma.user.findMany({
      where: { role: { name: 'staff' } },
      include: { 
        role: true,
        staffRecord: true
      }
    });
    
    console.log('Users with staff role:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Staff Record: ${user.staffRecord ? user.staffRecord.id : 'None'}`);
    });
    
    // Get all staff records
    const staff = await prisma.staff.findMany();
    console.log('\nAll staff records:');
    staff.forEach(s => {
      console.log(`- ID: ${s.id}, Name: ${s.name}, Email: ${s.email}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStaffMapping();
