const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetStaffPassword() {
  try {
    // Find the staff user
    const staffUser = await prisma.user.findUnique({
      where: { email: 'pharmacist@globalpharmatrading.co.uk' }
    });
    
    if (!staffUser) {
      console.log('❌ Staff user not found');
      return;
    }
    
    console.log('Found staff user:', staffUser.name);
    
    // Hash a new password
    const hashedPassword = await bcrypt.hash('staff123', 10);
    
    // Update the password
    await prisma.user.update({
      where: { id: staffUser.id },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Password updated for staff user');
    console.log('New credentials: pharmacist@globalpharmatrading.co.uk / staff123');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetStaffPassword();
