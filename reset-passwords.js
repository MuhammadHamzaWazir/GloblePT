#!/usr/bin/env node

// Reset passwords for existing users to known values
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔑 Resetting user passwords to known values...');
    console.log('');
    
    const passwordUpdates = [
      { email: 'admin@pharmacy.com', password: 'admin123' },
      { email: 'staff@pharmacy.com', password: 'staff123' },
      { email: 'customer@pharmacy.com', password: 'customer123' },
      { email: 'assistant@pharmacy.com', password: 'assistant123' },
      { email: 'supervisor@pharmacy.com', password: 'supervisor123' }
    ];
    
    for (const update of passwordUpdates) {
      const hashedPassword = await bcrypt.hash(update.password, 12);
      
      await prisma.user.update({
        where: { email: update.email },
        data: { password: hashedPassword }
      });
      
      console.log(`✅ ${update.email} → password: ${update.password}`);
    }
    
    console.log('');
    console.log('🎯 LOGIN CREDENTIALS:');
    console.log('- mhamzawazir1996@gmail.com / password123 (2FA enabled)');
    console.log('- admin@pharmacy.com / admin123');
    console.log('- staff@pharmacy.com / staff123');
    console.log('- customer@pharmacy.com / customer123');
    console.log('- assistant@pharmacy.com / assistant123');
    console.log('- supervisor@pharmacy.com / supervisor123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();
