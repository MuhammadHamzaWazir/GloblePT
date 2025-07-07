#!/usr/bin/env node

// Simple test to get the actual error response
async function testLoginDebug() {
  try {
    console.log('🔐 Testing login with debug info...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'mhamzawazir1996@gmail.com',
        password: 'password123'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Raw response:');
    console.log(text);
    
  } catch (error) {
    console.error('Request failed:', error.message);
  }
}

testLoginDebug();
