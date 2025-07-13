const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    
    console.log('Current users:');
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) - Role: ${u.role?.name || 'No role'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
