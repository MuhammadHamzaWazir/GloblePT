const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testAdminAccess() {
  console.log('🔍 Testing Admin Access...\n');

  try {
    // Check admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: { name: 'admin' } },
      include: { role: true }
    });

    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    console.log(`👤 Admin user: ${adminUser.name} (${adminUser.email})`);
    console.log(`🔑 Role: ${adminUser.role?.name}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: adminUser.id, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🔑 JWT token generated');

    // Test auth/me endpoint
    const fetch = require('node-fetch');
    
    const authResponse = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${token}`
      }
    });

    console.log('🔐 Auth/me response:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('🔐 Auth data:', authData);
    }

    // Test admin complaints endpoint
    const complaintsResponse = await fetch('http://localhost:3000/api/admin/complaints', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${token}`
      }
    });

    console.log('📋 Admin complaints response:', complaintsResponse.status);
    
    if (complaintsResponse.ok) {
      const complaintsData = await complaintsResponse.json();
      console.log('📋 Complaints count:', complaintsData.data?.complaints?.length || 0);
    } else {
      const errorText = await complaintsResponse.text();
      console.log('❌ Error:', errorText);
    }

    console.log('\n🎯 NEXT STEPS:');
    console.log('=============');
    console.log('1. Login to admin at: http://localhost:3000/auth/login');
    console.log(`2. Use credentials: ${adminUser.email} / admin123`);
    console.log('3. Navigate to: http://localhost:3000/admin/dashboard/complaints');
    console.log('4. Check browser console for debug logs');

  } catch (error) {
    console.error('❌ Error testing admin access:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminAccess();
