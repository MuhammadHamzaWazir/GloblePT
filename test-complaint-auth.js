const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testComplaintAuth() {
  console.log('🔐 Testing Complaint Authentication...\n');

  try {
    // Check if we have a customer user
    const customer = await prisma.user.findFirst({
      where: { role: { name: 'user' } },
      include: { role: true }
    });

    if (!customer) {
      console.log('❌ No customer user found');
      return;
    }

    console.log(`👤 Customer found: ${customer.name} (${customer.email})`);

    // Generate a JWT token for this user
    const token = jwt.sign(
      { userId: customer.id, email: customer.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🔑 Generated JWT token for testing');

    // Test the complaint API with the token
    const fetch = require('node-fetch');
    
    const response = await fetch('http://localhost:3000/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${token}`
      },
      body: JSON.stringify({
        title: 'Test Complaint with Auth',
        description: 'This is a test complaint with proper authentication',
        category: 'service',
        priority: 'medium'
      })
    });

    const data = await response.json();
    console.log('📡 API Response Status:', response.status);
    console.log('📡 API Response Data:', data);

    if (response.ok && data.success) {
      console.log('✅ Complaint submitted successfully!');
    } else {
      console.log('❌ Failed to submit complaint');
      console.log('Error:', data.message);
    }

    // Check the complaints in the database
    const complaints = await prisma.complaint.findMany({
      where: { userId: customer.id },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    console.log(`\n📋 Customer's complaints (${complaints.length} total):`);
    complaints.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.title} - ${c.status} (${c.category})`);
    });

  } catch (error) {
    console.error('❌ Error testing complaint auth:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testComplaintAuth();
