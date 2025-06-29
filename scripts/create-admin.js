const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestAdmin() {
  const prisma = new PrismaClient();
  try {
    console.log('🔍 Creating/updating test admin user...');
    
    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: { email: 'admin@test.com' }
    });
    
    // Get admin role
    const adminRole = await prisma.role.findFirst({
      where: { 
        name: {
          contains: 'admin'
        }
      }
    });
    
    if (!adminRole) {
      console.log('❌ Admin role not found! Creating admin role...');
      const newAdminRole = await prisma.role.create({
        data: { name: 'admin' }
      });
      console.log('✅ Admin role created:', newAdminRole);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('🔐 Password hashed');
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@test.com',
        password: hashedPassword,
        address: '123 Admin Street, Admin City, AC 12345',
        roleId: adminRole?.id || null
      },
      include: {
        role: true
      }
    });
    
    console.log('✅ Admin user created successfully:');
    console.log('  ID:', adminUser.id);
    console.log('  Name:', adminUser.name);
    console.log('  Email:', adminUser.email);
    console.log('  Role:', adminUser.role?.name || 'No role');
    console.log('  Address:', adminUser.address);
    
    // Test password immediately
    const testPassword = await bcrypt.compare('password123', adminUser.password);
    console.log('  Password test:', testPassword ? '✅ VALID' : '❌ INVALID');
    
    console.log('\n🎉 Test admin user ready!');
    console.log('Login at: http://localhost:3000/auth/login');
    console.log('Email: admin@test.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestAdmin();
