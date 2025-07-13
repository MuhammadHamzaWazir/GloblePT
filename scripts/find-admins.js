const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdmins() {
  try {
    console.log('🔍 Checking admin users...');

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true 
      }
    });

    console.log('👥 Admin users found:', admins.length);
    admins.forEach(admin => {
      console.log(`- ID: ${admin.id}, Name: ${admin.name}, Email: ${admin.email}`);
    });

    if (admins.length === 0) {
      console.log('⚠️  No admin users found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmins();
