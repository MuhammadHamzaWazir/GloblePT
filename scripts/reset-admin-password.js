const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Try to update multiple possible admin emails
    const adminEmails = ['admin@pharmacy.com', 'admin@globalpharmatrading.co.uk', 'admin@globalpharma.com'];
    
    for (const email of adminEmails) {
      try {
        const result = await prisma.user.update({
          where: { email },
          data: { password: hashedPassword }
        });
        console.log('✅ Password reset for:', result.email);
      } catch (error) {
        if (error.code === 'P2025') {
          console.log(`   User ${email} not found`);
        } else {
          console.error(`❌ Error updating ${email}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('❌ General error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
