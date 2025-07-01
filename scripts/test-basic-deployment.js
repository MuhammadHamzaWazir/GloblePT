#!/usr/bin/env node

/**
 * Simple Production Deployment Test
 * Basic test to check if the deployment is working
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'https://pharmacy-management-system-ch0ngngku.vercel.app';

async function testBasicEndpoints() {
  console.log('🔍 Testing basic deployment endpoints...');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  
  // Test main page
  try {
    console.log('\n1. Testing main page...');
    const response = await fetch(BASE_URL);
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    const text = await response.text();
    console.log(`   Content length: ${text.length} characters`);
    console.log(`   Title found: ${text.includes('<title>') ? 'Yes' : 'No'}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test a simple API endpoint
  try {
    console.log('\n2. Testing API directory...');
    const response = await fetch(`${BASE_URL}/api`);
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 200)}...`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test health endpoint
  try {
    console.log('\n3. Testing health endpoint...');
    const response = await fetch(`${BASE_URL}/api/health`);
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    const text = await response.text();
    console.log(`   Response: ${text}`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  // Test users endpoint
  try {
    console.log('\n4. Testing users endpoint...');
    const response = await fetch(`${BASE_URL}/api/users`);
    console.log(`   Status: ${response.status}`);
    console.log(`   OK: ${response.ok}`);
    const text = await response.text();
    console.log(`   Response: ${text.substring(0, 200)}...`);
  } catch (error) {
    console.log(`   Error: ${error.message}`);
  }
  
  console.log('\n✅ Basic deployment test completed!');
}

testBasicEndpoints().catch(error => {
  console.error('❌ Test failed:', error.message);
});
