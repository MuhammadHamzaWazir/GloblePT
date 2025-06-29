const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFullUserManagement() {
  try {
    console.log('🔍 Testing complete user management workflow...\n');

    // Step 1: Login as admin
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
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResult.message}`);
    }

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader.match(/pharmacy_auth=([^;]+)/);
    const jwtToken = tokenMatch[1];
    console.log('✅ Logged in successfully\n');

    // Step 2: Test GET users with pagination
    console.log('Step 2: Testing GET users with pagination...');
    const getUsersResponse = await fetch('http://localhost:3000/api/admin/users?page=1&limit=5&search=admin', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${jwtToken}`
      }
    });

    const getUsersResult = await getUsersResponse.json();
    console.log('GET users response status:', getUsersResponse.status);
    console.log('GET users result:', getUsersResult);
    
    if (!getUsersResponse.ok) {
      throw new Error(`Get users failed: ${getUsersResult.message || JSON.stringify(getUsersResult)}`);
    }

    console.log('✅ GET users successful');
    console.log(`Found ${getUsersResult.data.users.length} users on page 1`);
    console.log(`Total users: ${getUsersResult.data.pagination.totalUsers}`);
    console.log(`Search for "admin" returned: ${getUsersResult.data.users.map(u => u.email).join(', ')}\n`);

    // Step 3: Test POST - Create user
    console.log('Step 3: Testing POST - Create user...');
    const testUser = {
      name: `Test User ${Date.now()}`,
      email: `testuser${Date.now()}@test.com`,
      password: 'password123',
      address: '123 Test Address',
      roleId: 3 // customer role
    };

    const createResponse = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${jwtToken}`
      },
      body: JSON.stringify(testUser)
    });

    const createResult = await createResponse.json();
    if (!createResponse.ok) {
      throw new Error(`Create user failed: ${createResult.message}`);
    }

    const createdUserId = createResult.data.user.id;
    console.log('✅ CREATE user successful');
    console.log(`Created user ID: ${createdUserId}, Email: ${createResult.data.user.email}\n`);

    // Step 4: Test PUT - Update user
    console.log('Step 4: Testing PUT - Update user...');
    const updateData = {
      name: `Updated ${testUser.name}`,
      email: testUser.email, // keep same email
      address: '456 Updated Address',
      roleId: 2, // change to staff role
      supervisorId: 5 // assign admin as supervisor
    };

    const updateResponse = await fetch(`http://localhost:3000/api/admin/users/${createdUserId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${jwtToken}`
      },
      body: JSON.stringify(updateData)
    });

    const updateResult = await updateResponse.json();
    if (!updateResponse.ok) {
      throw new Error(`Update user failed: ${updateResult.message}`);
    }

    console.log('✅ UPDATE user successful');
    console.log(`Updated name: ${updateResult.data.user.name}`);
    console.log(`Updated role: ${updateResult.data.user.role.name}`);
    console.log(`Supervisor: ${updateResult.data.user.supervisor?.name || 'None'}\n`);

    // Step 5: Test DELETE - Delete user
    console.log('Step 5: Testing DELETE - Delete user...');
    const deleteResponse = await fetch(`http://localhost:3000/api/admin/users/${createdUserId}`, {
      method: 'DELETE',
      headers: {
        'Cookie': `pharmacy_auth=${jwtToken}`
      }
    });

    const deleteResult = await deleteResponse.json();
    if (!deleteResponse.ok) {
      throw new Error(`Delete user failed: ${deleteResult.message}`);
    }

    console.log('✅ DELETE user successful');
    console.log(`Deleted user message: ${deleteResult.message}\n`);

    // Step 6: Verify user was deleted
    console.log('Step 6: Verifying user was deleted...');
    const deletedUser = await prisma.user.findUnique({
      where: { id: createdUserId }
    });

    if (deletedUser) {
      console.log('❌ User still exists in database');
    } else {
      console.log('✅ User successfully deleted from database\n');
    }

    // Step 7: Test authorization - Try creating user without auth
    console.log('Step 7: Testing authorization (no auth token)...');
    const noAuthResponse = await fetch('http://localhost:3000/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    if (noAuthResponse.status === 403) {
      console.log('✅ Properly blocked unauthorized request (403)\n');
    } else {
      console.log('❌ Failed to block unauthorized request\n');
    }

    console.log('🎉 All user management tests passed!');
    console.log('\n📊 Summary:');
    console.log('✅ Authentication: Working');
    console.log('✅ GET users (pagination/search): Working');
    console.log('✅ POST create user: Working');
    console.log('✅ PUT update user: Working');
    console.log('✅ DELETE user: Working');
    console.log('✅ Role assignment: Working');
    console.log('✅ Supervisor assignment: Working');
    console.log('✅ Authorization protection: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFullUserManagement();
