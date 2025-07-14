const fetch = require('node-fetch');

async function quickLoginTest() {
  console.log('Quick login test...');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
  try {
    const response = await fetch('https://globalpharmatrading.co.uk/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    const text = await response.text();
    console.log('Response:', text);
    
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.log('❌ Request timed out after 10 seconds');
    } else {
      console.error('Error:', error.message);
    }
  }
}

quickLoginTest();
