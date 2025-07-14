const { PrismaClient } = require('@prisma/client');

async function getAdminUsers() {
  process.env.DATABASE_URL = "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway";
  
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Getting admin users...');
    
    const adminUsers = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountStatus: true,
        createdAt: true
      }
    });
    
    console.log('Admin users found:');
    adminUsers.forEach(user => {
      console.log(`- Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Status: ${user.accountStatus}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getAdminUsers();
