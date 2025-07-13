const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const result = await prisma.user.update({
      where: { email: 'test@example.com' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password reset for:', result.email);
    console.log('   New password: password123');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
