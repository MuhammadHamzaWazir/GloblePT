// Test the simple registration API locally
const testRegistration = async () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "testpass123",
    address: "123 Test Street, Test City",
    phone: "07123456789",
    dateOfBirth: "1990-01-01"
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/register-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });

    const data = await response.json();
    console.log('Registration test result:', data);

    if (response.ok) {
      console.log('✅ Registration successful!');
    } else {
      console.log('❌ Registration failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

testRegistration();
