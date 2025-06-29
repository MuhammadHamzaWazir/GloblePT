#!/usr/bin/env node

/**
 * Initialize Production Database
 * This script calls the setup-production endpoint to initialize the database
 */

async function initializeDatabase() {
  console.log('🚀 Initializing production database...');
  
  const BASE_URL = 'https://pharmacy-management-system-2ul029pt1.vercel.app';
  
  try {
    // Try to make a simple GET request first
    console.log('📡 Testing GET endpoint...');
    const getResponse = await fetch(`${BASE_URL}/api/setup-production`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Setup-Script/1.0'
      }
    });
    
    console.log('GET Response status:', getResponse.status);
    console.log('GET Response headers:', Object.fromEntries(getResponse.headers.entries()));
    
    const getResult = await getResponse.text();
    console.log('GET Response body (first 200 chars):', getResult.substring(0, 200));
    
    if (!getResponse.ok) {
      console.error('❌ GET request failed');
      return;
    }
    
    // Now try the POST request
    console.log('\n📡 Testing POST endpoint...');
    const postResponse = await fetch(`${BASE_URL}/api/setup-production`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Setup-Script/1.0'
      }
    });
    
    console.log('POST Response status:', postResponse.status);
    console.log('POST Response headers:', Object.fromEntries(postResponse.headers.entries()));
    
    const postResult = await postResponse.text();
    console.log('POST Response body (first 500 chars):', postResult.substring(0, 500));
    
    if (postResponse.ok) {
      try {
        const data = JSON.parse(postResult);
        console.log('✅ Database initialization successful!');
        console.log('\n📊 Database Summary:');
        console.log(JSON.stringify(data.data?.summary, null, 2));
        
        console.log('\n🔐 Test Accounts:');
        console.log('Admin:', data.data?.testAccounts?.admin);
        console.log('Staff:', data.data?.testAccounts?.staff);
        console.log('Customers:', data.data?.testAccounts?.customers);
        
        console.log(`\n🌐 You can now access your live pharmacy system at:`);
        console.log(`   ${BASE_URL}`);
        
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError.message);
      }
    } else {
      console.error('❌ Database initialization failed');
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ for fetch API support');
  process.exit(1);
}

// Run the initialization
initializeDatabase();
