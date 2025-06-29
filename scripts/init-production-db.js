#!/usr/bin/env node

/**
 * Initialize Production Database
 * This script calls the setup-production endpoint to initialize the database
 */

const https = require('https');

const BASE_URL = 'https://pharmacy-management-system-j7e06wp04.vercel.app';

async function initializeDatabase() {
  console.log('🚀 Initializing production database...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/setup-production`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Database initialization successful!');
      console.log('\n📊 Database Summary:');
      console.log(JSON.stringify(data.data.summary, null, 2));
      
      console.log('\n🔐 Test Accounts:');
      console.log('Admin:', data.data.testAccounts.admin);
      console.log('Staff:', data.data.testAccounts.staff);
      console.log('Customers:', data.data.testAccounts.customers);
      
      console.log(`\n🌐 You can now access your live pharmacy system at:`);
      console.log(`   ${BASE_URL}`);
      
    } else {
      console.error('❌ Database initialization failed:');
      console.error(data.message);
      if (data.error) {
        console.error('Error details:', data.error);
      }
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Run the initialization
initializeDatabase();
