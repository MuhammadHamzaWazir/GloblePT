const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAdmin() {
  try {
    await prisma.user.update({
      where: { email: 'admin@pharmacy.com' },
      data: { 
        identityVerified: true,
        ageVerified: true,
        capacityAssessed: true,
        accountStatus: 'active'
      }
    });
    console.log('✅ Admin account verified');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();
