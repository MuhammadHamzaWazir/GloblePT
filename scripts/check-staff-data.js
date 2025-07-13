const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStaffData() {
  try {
    console.log('🔍 Checking staff table...');
    
    const staff = await prisma.staff.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });
    
    console.log('📊 Staff count:', staff.length);
    
    if (staff.length > 0) {
      console.log('📝 Staff records:');
      staff.forEach(s => {
        console.log(`  - ID: ${s.id}, Name: ${s.name}, Email: ${s.email}`);
      });
    } else {
      console.log('⚠️ No staff records found in database');
      console.log('🔄 Let me check if we need to create some staff records...');
      
      // Check if there are any users with staff role
      const staffUsers = await prisma.user.findMany({
        where: {
          role: 'staff'
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true
        }
      });
      
      console.log('👥 Users with staff role:', staffUsers.length);
      if (staffUsers.length > 0) {
        console.log('📝 Staff users:');
        staffUsers.forEach(u => {
          console.log(`  - ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking staff data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaffData();
