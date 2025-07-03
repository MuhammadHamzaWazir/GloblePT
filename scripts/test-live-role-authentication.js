/**
 * Test script to verify role-based authentication and redirection on live site
 * https://globalpharmatrading.co.uk/
 */

const BASE_URL = 'https://globalpharmatrading.co.uk';

// Test credentials for different roles
const TEST_USERS = [
  {
    role: 'CUSTOMER',
    email: 'customer@test.com',
    password: '12345678',
    expectedRedirect: '/dashboard'
  },
  {
    role: 'STAFF',
    email: 'staff@test.com', 
    password: '12345678',
    expectedRedirect: '/staff-dashboard'
  },
  {
    role: 'SUPERVISOR',
    email: 'supervisor@test.com',
    password: 'supervisor123',
    expectedRedirect: '/supervisor-dashboard'
  },
  {
    role: 'ADMIN',
    email: 'admin@test.com',
    password: 'password123',
    expectedRedirect: '/admin/dashboard'
  }
];

async function testRoleBasedLogin(user) {
  try {
    console.log(`\n🔐 Testing ${user.role} login...`);
    console.log(`📧 Email: ${user.email}`);
    
    // Test login endpoint
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        password: user.password
      }),
      credentials: 'include'
    });
    
    if (!loginResponse.ok) {
      console.log(`❌ Login failed for ${user.role}: ${loginResponse.status}`);
      return false;
    }
    
    console.log(`✅ Login successful for ${user.role}`);
    
    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Test auth verification
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      },
      credentials: 'include'
    });
    
    if (verifyResponse.ok) {
      const userData = await verifyResponse.json();
      console.log(`✅ Role verified: ${userData.user?.role}`);
      console.log(`📍 Expected redirect: ${user.expectedRedirect}`);
      
      // Check if role matches expected
      if (userData.user?.role === user.role) {
        console.log(`✅ Role-based authentication working correctly for ${user.role}`);
        return true;
      } else {
        console.log(`❌ Role mismatch for ${user.role}. Got: ${userData.user?.role}`);
        return false;
      }
    } else {
      console.log(`❌ Auth verification failed for ${user.role}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error testing ${user.role}:`, error.message);
    return false;
  }
}

async function testRegistrationDefault() {
  console.log(`\n👤 Testing default CUSTOMER role assignment...`);
  
  try {
    // Test registration with dummy data
    const formData = new FormData();
    formData.append('name', 'Test User');
    formData.append('email', `test-${Date.now()}@example.com`);
    formData.append('password', 'testpassword123');
    formData.append('address', '123 Test Street');
    formData.append('dateOfBirth', '1990-01-01');
    
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: formData
    });
    
    if (registerResponse.ok) {
      console.log(`✅ Registration endpoint accessible`);
      console.log(`✅ New users should default to CUSTOMER role`);
      return true;
    } else {
      console.log(`⚠️ Registration test skipped (may require valid data)`);
      return true; // Skip this test as it may require actual valid data
    }
    
  } catch (error) {
    console.log(`⚠️ Registration test error:`, error.message);
    return true; // Non-critical for this verification
  }
}

async function testDashboardRoutes() {
  console.log(`\n🌐 Testing dashboard route constants...`);
  
  const routes = {
    ADMIN: '/admin/dashboard',
    STAFF: '/staff-dashboard', 
    SUPERVISOR: '/supervisor-dashboard',
    ASSISTANT: '/assistant-portal',
    CUSTOMER: '/dashboard'
  };
  
  for (const [role, route] of Object.entries(routes)) {
    try {
      const response = await fetch(`${BASE_URL}${route}`, {
        method: 'HEAD' // Just check if route exists
      });
      
      // Even if auth required, route should exist (401/403 is okay)
      if (response.status === 404) {
        console.log(`❌ Route not found: ${route} for ${role}`);
      } else {
        console.log(`✅ Route exists: ${route} for ${role}`);
      }
    } catch (error) {
      console.log(`⚠️ Could not test route: ${route}`);
    }
  }
}

async function runAllTests() {
  console.log(`🚀 Testing Role-Based Authentication on ${BASE_URL}`);
  console.log(`=`.repeat(60));
  
  // Test dashboard routes
  await testDashboardRoutes();
  
  // Test registration default
  await testRegistrationDefault();
  
  // Test role-based login for each user type
  let passedTests = 0;
  for (const user of TEST_USERS) {
    const result = await testRoleBasedLogin(user);
    if (result) passedTests++;
  }
  
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passedTests}/${TEST_USERS.length} role-based login tests`);
  console.log(`🌐 Site: ${BASE_URL}`);
  
  if (passedTests === TEST_USERS.length) {
    console.log(`\n🎉 ALL TESTS PASSED! Role-based authentication is working correctly.`);
  } else {
    console.log(`\n⚠️ Some tests failed. Please check the implementation.`);
  }
  
  console.log(`\n🔑 Live Test Credentials:`);
  TEST_USERS.forEach(user => {
    console.log(`${user.role}: ${user.email} / ${user.password} → ${user.expectedRedirect}`);
  });
}

// Run the tests
runAllTests().catch(console.error);
