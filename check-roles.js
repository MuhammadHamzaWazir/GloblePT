#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRoles() {
  try {
    const roles = await prisma.role.findMany();
    console.log('Available roles:', roles.map(r => r.name));
    
    const users = await prisma.user.findMany({
      include: { role: true }
    });
    
    console.log('\nUsers and their roles:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.role.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoles();
