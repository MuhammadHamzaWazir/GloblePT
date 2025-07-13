const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStaffPasswords() {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { name: 'staff' } },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: { select: { name: true } }
      }
    });
    
    console.log('Staff users:');
    staff.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Password: ${user.password ? 'Set' : 'Not Set'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaffPasswords();
