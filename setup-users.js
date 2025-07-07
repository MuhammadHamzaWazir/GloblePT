#!/usr/bin/env node

// Create the missing user and check existing passwords
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function setupUsers() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Setting up users and checking passwords...');
    console.log('');
    
    // Check existing passwords
    console.log('📋 Checking existing user passwords:');
    const users = await prisma.user.findMany({
      select: { id: true, email: true, password: true, role: true }
    });
    
    const testPasswords = ['password123', 'admin123', 'password', '123456', 'staff123', 'customer123'];
    
    for (const user of users) {
      console.log(`\n🔍 ${user.email}:`);
      for (const testPwd of testPasswords) {
        const isCorrect = await bcrypt.compare(testPwd, user.password);
        if (isCorrect) {
          console.log(`  ✅ Password: "${testPwd}"`);
          break;
        }
      }
    }
    
    // Create the missing user
    console.log('\n🆕 Creating user: mhamzawazir1996@gmail.com');
    
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const newUser = await prisma.user.create({
      data: {
        name: 'Muhammad Hamza Wazir',
        email: 'mhamzawazir1996@gmail.com',
        password: hashedPassword,
        address: '123 Main Street, London, UK',
        phone: '+44 123 456 7890',
        role: {
          connect: { name: 'customer' }
        },
        twoFactorEnabled: true, // Enable 2FA by default
        accountStatus: 'verified',
        identityVerified: true
      }
    });
    
    console.log('✅ User created successfully:');
    console.log('- Email: mhamzawazir1996@gmail.com');
    console.log('- Password: password123');
    console.log('- Role: customer');
    console.log('- 2FA Enabled: true');
    console.log('- ID:', newUser.id);
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('ℹ️  User already exists, just checking passwords...');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupUsers();
