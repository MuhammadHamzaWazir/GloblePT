#!/usr/bin/env node

// Check user status and 2FA settings
const { PrismaClient } = require('@prisma/client');

async function checkUserStatus() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking user: mhamzawazir1996@gmail.com');
    console.log('');
    
    const user = await prisma.user.findUnique({
      where: { email: 'mhamzawazir1996@gmail.com' }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Role:', user.role);
      console.log('- 2FA Enabled:', user.twoFactorEnabled || 'Not set (null)');
      console.log('- Created:', user.createdAt);
      console.log('- Updated:', user.updatedAt);
      console.log('- Password Hash Length:', user.password?.length || 'No password set');
      
      // Check if password is correct
      const bcrypt = require('bcryptjs');
      const isPasswordCorrect = await bcrypt.compare('password123', user.password);
      console.log('- Password "password123" correct:', isPasswordCorrect);
      
      // Try common admin passwords
      const testPasswords = ['admin123', 'password', '123456'];
      for (const testPwd of testPasswords) {
        const isCorrect = await bcrypt.compare(testPwd, user.password);
        if (isCorrect) {
          console.log(`- Correct password found: "${testPwd}"`);
          break;
        }
      }
      
    } else {
      console.log('❌ User not found in database');
      console.log('');
      console.log('Available users:');
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, role: true, twoFactorEnabled: true }
      });
      console.table(allUsers);
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
