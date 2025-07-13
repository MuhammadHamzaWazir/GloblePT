const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testAdminComplaintsAPI() {
  console.log('🔍 Testing Admin Complaints API...\n');

  try {
    // Check if complaints exist in database
    const totalComplaints = await prisma.complaint.count();
    console.log(`📊 Total complaints in database: ${totalComplaints}`);

    if (totalComplaints === 0) {
      console.log('❌ No complaints found in database');
      return;
    }

    // Show sample complaints
    const sampleComplaints = await prisma.complaint.findMany({
      take: 3,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log('\n📋 Sample complaints:');
    sampleComplaints.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.title} by ${c.user.name} - ${c.status}`);
    });

    // Check if admin user exists
    const adminUser = await prisma.user.findFirst({
      where: { role: { name: 'admin' } },
      include: { role: true }
    });

    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }

    console.log(`\n👤 Admin user: ${adminUser.name} (${adminUser.email})`);

    // Generate JWT token for admin
    const token = jwt.sign(
      { userId: adminUser.id, email: adminUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🔑 Generated JWT token for admin');

    // Test the API endpoint
    const fetch = require('node-fetch');
    
    const response = await fetch('http://localhost:3000/api/admin/complaints', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${token}`
      }
    });

    console.log('📡 API Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('📡 API Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ API working correctly!');
      console.log(`📊 Found ${data.data.complaints.length} complaints`);
    } else {
      console.log('❌ API returned error:', data.message);
    }

  } catch (error) {
    console.error('❌ Error testing admin complaints API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminComplaintsAPI();
