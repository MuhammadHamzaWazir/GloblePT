const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAllUsers() {
  try {
    await prisma.user.updateMany({
      data: { 
        identityVerified: true,
        ageVerified: true,
        capacityAssessed: true,
        accountStatus: 'active'
      }
    });
    console.log('✅ All user accounts verified');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAllUsers();
