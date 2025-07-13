const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkAndCreateAdmin() {
  console.log('🔍 Checking and Creating Admin User...\n');

  try {
    // Check if admin user exists
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        email: 'admin@globalpharmatrading.co.uk'
      },
      include: { role: true }
    });

    if (existingAdmin) {
      console.log('👤 Admin user found:', existingAdmin.name);
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Role:', existingAdmin.role?.name);
      
      // Update password to ensure it's correct
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword }
      });
      console.log('✅ Password updated to: admin123');
      
      return existingAdmin;
    }

    // Find admin role
    const adminRole = await prisma.role.findFirst({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      console.log('❌ Admin role not found, creating...');
      const newAdminRole = await prisma.role.create({
        data: { name: 'admin' }
      });
      console.log('✅ Admin role created');
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@globalpharmatrading.co.uk',
        password: hashedPassword,
        phone: '123-456-7890',
        address: '123 Admin Street',
        roleId: adminRole ? adminRole.id : newAdminRole.id
      }
    });

    console.log('✅ Admin user created:');
    console.log('   Name:', adminUser.name);
    console.log('   Email:', adminUser.email);
    console.log('   Password: admin123');

    return adminUser;

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdmin().then(() => {
  console.log('\n🎯 NOW YOU CAN:');
  console.log('===============');
  console.log('1. Go to: http://localhost:3000/auth/login');
  console.log('2. Login with: admin@globalpharmatrading.co.uk / admin123');
  console.log('3. Navigate to: http://localhost:3000/admin/dashboard/complaints');
  console.log('4. Should see complaints data!');
});
