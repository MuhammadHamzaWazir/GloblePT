const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStaff() {
  try {
    const staff = await prisma.staff.findMany({
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    console.log('Staff records:', staff);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStaff();
