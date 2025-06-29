const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugGetUsers() {
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123'
      })
    });

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader.match(/pharmacy_auth=([^;]+)/);
    const jwtToken = tokenMatch[1];

    // Test GET users
    const getUsersResponse = await fetch('http://localhost:3000/api/admin/users?page=1&limit=5', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${jwtToken}`
      }
    });

    console.log('GET users status:', getUsersResponse.status);
    console.log('GET users headers:', Object.fromEntries(getUsersResponse.headers.entries()));
    
    const getUsersResult = await getUsersResponse.text();
    console.log('GET users raw response:', getUsersResult);
    
    try {
      const parsed = JSON.parse(getUsersResult);
      console.log('GET users parsed:', parsed);
    } catch (e) {
      console.log('Failed to parse JSON:', e.message);
    }

  } catch (error) {
    console.error('Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugGetUsers();
