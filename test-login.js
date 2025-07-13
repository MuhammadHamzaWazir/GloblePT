const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testLogin() {
  console.log('🔐 Testing Login System...\n');

  try {
    // Check if we have a customer user
    let customer = await prisma.user.findFirst({
      where: { role: { name: 'user' } },
      include: { role: true }
    });

    if (!customer) {
      console.log('Creating customer user...');
      const customerRole = await prisma.role.findFirst({
        where: { name: 'user' }
      });

      // Create customer with known password
      const hashedPassword = await bcrypt.hash('customer123', 10);
      customer = await prisma.user.create({
        data: {
          name: 'Test Customer',
          email: 'customer@test.com',
          password: hashedPassword,
          phone: '1234567890',
          address: '123 Test Street',
          roleId: customerRole.id
        }
      });
    }

    console.log(`👤 Customer: ${customer.name} (${customer.email})`);

    // Test login API
    const fetch = require('node-fetch');
    
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: customer.email,
        password: 'customer123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('🔑 Login Response Status:', loginResponse.status);
    console.log('🔑 Login Response Data:', loginData);

    if (loginResponse.ok && loginData.success) {
      console.log('✅ Login successful!');
      console.log('\n📋 You can now test the complaint submission:');
      console.log('1. Go to: http://localhost:3000/auth/login');
      console.log(`2. Login with: ${customer.email} / customer123`);
      console.log('3. Navigate to: http://localhost:3000/complaints');
      console.log('4. Submit a complaint');
    } else {
      console.log('❌ Login failed');
      console.log('Error:', loginData.message);
    }

    // Also check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: customer.email }
    });

    if (existingUser) {
      console.log('\n✅ User exists in database');
      console.log('Password hash stored:', existingUser.password ? 'Yes' : 'No');
    }

  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
