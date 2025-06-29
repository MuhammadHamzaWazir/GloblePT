const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany({ 
      select: { email: true, name: true, id: true }, 
      take: 3 
    });
    console.log('Sample users:', users);
    
    // Also check roles
    const roles = await prisma.role.findMany({
      select: { name: true, id: true }
    });
    console.log('Available roles:', roles);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
