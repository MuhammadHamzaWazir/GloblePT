#!/usr/bin/env node

// Test if we can connect to database directly
const { PrismaClient } = require('@prisma/client');

async function testBasicLogin() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing basic login logic...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'mhamzawazir1996@gmail.com' },
      include: { role: true }
    });
    
    if (user) {
      console.log('✅ User found:', user.email);
      console.log('Role:', user.role?.name);
      console.log('2FA Enabled:', user.twoFactorEnabled);
      
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare('password123', user.password);
      console.log('Password valid:', isValidPassword);
      
      if (isValidPassword && user.twoFactorEnabled) {
        console.log('🔐 2FA should be triggered');
        console.log('📧 Email should be sent to:', user.email);
      } else if (isValidPassword) {
        console.log('✅ Direct login should succeed');
      }
      
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testBasicLogin();
