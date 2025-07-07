#!/usr/bin/env node

// Create a test user without 2FA for testing the login flow
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🆕 Creating test user without 2FA...');
    
    const hashedPassword = await bcrypt.hash('test123', 12);
    
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User No 2FA',
        email: 'test@example.com',
        password: hashedPassword,
        address: '123 Test Street, Test City',
        phone: '+44 123 456 7890',
        role: {
          connect: { name: 'customer' }
        },
        twoFactorEnabled: false, // Disable 2FA
        accountStatus: 'verified',
        identityVerified: true
      }
    });
    
    console.log('✅ Test user created:');
    console.log('- Email: test@example.com');
    console.log('- Password: test123');
    console.log('- 2FA Enabled: false');
    console.log('- Role: customer');
    console.log('- ID:', testUser.id);
    
    console.log('\n🎯 Test users for login:');
    console.log('1. mhamzawazir1996@gmail.com / password123 (2FA ENABLED)');
    console.log('2. test@example.com / test123 (2FA DISABLED)');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  Test user already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
