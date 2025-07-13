const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔍 Creating admin user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('🔐 Password hashed');
    
    // Check if admin user exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@pharmacy.com' }
    });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists, updating password...');
      
      // Update existing admin user
      const adminUser = await prisma.user.update({
        where: { email: 'admin@pharmacy.com' },
        data: {
          password: hashedPassword,
          role: 'admin'
        }
      });
      
      console.log('✅ Admin user updated successfully!');
      console.log('📧 Email: admin@pharmacy.com');
      console.log('🔑 Password: admin123');
      
    } else {
      // Create new admin user
      const adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@pharmacy.com',
          password: hashedPassword,
          address: '123 Admin Street, Admin City, AC 12345',
          role: 'admin',
          identityVerified: true,
          ageVerified: true,
          accountStatus: 'verified'
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log('📧 Email: admin@pharmacy.com');
      console.log('🔑 Password: admin123');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
