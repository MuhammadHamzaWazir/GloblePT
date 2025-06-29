const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserCreation() {
  try {
    console.log('🔍 Testing user creation workflow...\n');

    // Step 1: Login as admin to get JWT token
    console.log('Step 1: Logging in as admin...');
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

    const loginResult = await loginResponse.json();
    console.log('Login response:', loginResult);

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResult.message}`);
    }

    // Extract the JWT token from Set-Cookie header
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);

    if (!setCookieHeader) {
      throw new Error('No Set-Cookie header found in login response');
    }

    // Extract the token value
    const tokenMatch = setCookieHeader.match(/pharmacy_auth=([^;]+)/);
    if (!tokenMatch) {
      throw new Error('Could not extract token from Set-Cookie header');
    }

    const jwtToken = tokenMatch[1];
    console.log('JWT Token extracted:', jwtToken.substring(0, 50) + '...\n');

    // Step 2: Verify authentication
    console.log('Step 2: Verifying authentication...');
    const verifyResponse = await fetch('http://localhost:3000/api/auth/verify', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${jwtToken}`
      }
    });

    const verifyResult = await verifyResponse.json();
    console.log('Verify response:', verifyResult);

    if (!verifyResponse.ok) {
      throw new Error(`Auth verification failed: ${verifyResult.message}`);
    }

    console.log('✅ Authentication verified\n');

    // Step 3: Get available roles
    console.log('Step 3: Getting available roles...');
    const rolesResponse = await fetch('http://localhost:3000/api/admin/roles', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${jwtToken}`
      }
    });

    const rolesResult = await rolesResponse.json();
    console.log('Roles response:', rolesResult);

    if (!rolesResponse.ok) {
      throw new Error(`Failed to get roles: ${rolesResult.message}`);
    }

    const customerRole = rolesResult.roles.find(role => role.name === 'customer');
    if (!customerRole) {
      throw new Error('customer role not found');
    }

    console.log('✅ Customer role found:', customerRole, '\n');

    // Step 4: Create a new user
    console.log('Step 4: Creating a new user...');
    const newUserData = {
      name: 'Test User ' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      address: '123 Test Street, Test City',
      roleId: customerRole.id
    };

    console.log('New user data:', newUserData);

    const createUserResponse = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${jwtToken}`
      },
      body: JSON.stringify(newUserData)
    });

    const createUserResult = await createUserResponse.json();
    console.log('Create user response status:', createUserResponse.status);
    console.log('Create user response:', createUserResult);

    if (!createUserResponse.ok) {
      throw new Error(`User creation failed: ${createUserResult.message}`);
    }

    console.log('✅ User created successfully!');
    console.log('New user:', createUserResult.data.user);

    // Step 5: Verify the user was created in the database
    console.log('\nStep 5: Verifying user in database...');
    const dbUser = await prisma.user.findUnique({
      where: { email: newUserData.email },
      include: { role: true }
    });

    if (dbUser) {
      console.log('✅ User found in database:', {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role?.name,
        createdAt: dbUser.createdAt
      });
    } else {
      console.log('❌ User not found in database');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserCreation();
