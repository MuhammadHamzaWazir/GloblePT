async function testSimpleLogin() {
  console.log('Testing login...');
  try {
    const response = await fetch('https://globalpharmatrading.co.uk/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@test.com', password: 'admin123' })
    });
    
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    const text = await response.text();
    console.log('Response length:', text.length);
    console.log('Response preview:', text.substring(0, 200));
    
    if (response.ok) {
      console.log('✅ SUCCESS: Login is working!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSimpleLogin();
