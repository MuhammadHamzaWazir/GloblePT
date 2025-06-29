/**
 * Test script for Admin User Management API
 * This script tests the pagination and search functionality
 */

const API_BASE = 'http://localhost:3000';

async function testUsersAPI() {
  console.log('🧪 Testing Admin Users API...\n');

  try {
    // Test 1: Get all users with default pagination
    console.log('📋 Test 1: Get users with default pagination');
    const response1 = await fetch(`${API_BASE}/api/admin/users`);
    const data1 = await response1.json();
    
    if (data1.success) {
      console.log('✅ Success!');
      console.log(`   Users found: ${data1.data.users.length}`);
      console.log(`   Total users: ${data1.data.pagination.totalUsers}`);
      console.log(`   Current page: ${data1.data.pagination.currentPage}`);
      console.log(`   Total pages: ${data1.data.pagination.totalPages}`);
    } else {
      console.log('❌ Failed:', data1.error);
    }

    // Test 2: Get users with custom pagination
    console.log('\n📋 Test 2: Get users with custom pagination (page 1, limit 5)');
    const response2 = await fetch(`${API_BASE}/api/admin/users?page=1&limit=5`);
    const data2 = await response2.json();
    
    if (data2.success) {
      console.log('✅ Success!');
      console.log(`   Users returned: ${data2.data.users.length}`);
      console.log(`   Users: ${data2.data.users.map(u => u.name).join(', ')}`);
    } else {
      console.log('❌ Failed:', data2.error);
    }

    // Test 3: Search functionality
    console.log('\n🔍 Test 3: Search users by name "admin"');
    const response3 = await fetch(`${API_BASE}/api/admin/users?search=admin`);
    const data3 = await response3.json();
    
    if (data3.success) {
      console.log('✅ Success!');
      console.log(`   Search results: ${data3.data.users.length}`);
      console.log(`   Users: ${data3.data.users.map(u => `${u.name} (${u.email})`).join(', ')}`);
    } else {
      console.log('❌ Failed:', data3.error);
    }

    // Test 4: Search by email
    console.log('\n🔍 Test 4: Search users by email "test.com"');
    const response4 = await fetch(`${API_BASE}/api/admin/users?search=test.com`);
    const data4 = await response4.json();
    
    if (data4.success) {
      console.log('✅ Success!');
      console.log(`   Search results: ${data4.data.users.length}`);
      console.log(`   Users: ${data4.data.users.map(u => `${u.name} (${u.email})`).join(', ')}`);
    } else {
      console.log('❌ Failed:', data4.error);
    }

    // Test 5: Search by role
    console.log('\n🔍 Test 5: Search users by role "staff"');
    const response5 = await fetch(`${API_BASE}/api/admin/users?search=staff`);
    const data5 = await response5.json();
    
    if (data5.success) {
      console.log('✅ Success!');
      console.log(`   Search results: ${data5.data.users.length}`);
      console.log(`   Users: ${data5.data.users.map(u => `${u.name} (${u.role?.name || 'No role'})`).join(', ')}`);
    } else {
      console.log('❌ Failed:', data5.error);
    }

    console.log('\n🎉 API testing completed!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Note: This test requires authentication, so it will fail without proper login
// This is just for testing the API structure
testUsersAPI();
