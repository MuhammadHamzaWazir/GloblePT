const jwt = require('jsonwebtoken');

async function testComplaintsAPI() {
  try {
    console.log('🔍 Testing complaints API...');
    
    // Create a test token for admin user (you'll need to get real token from browser)
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
    
    const testToken = jwt.sign(
      {
        id: 1, // Assuming admin user ID is 1
        email: 'admin@globalpharmatrading.co.uk',
        name: 'Admin User',
        role: 'admin'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('🎫 Generated test token');
    
    // Test the API
    const response = await fetch('http://localhost:3000/api/admin/complaints', {
      headers: {
        'Cookie': `pharmacy_auth=${testToken}`
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', {
        success: data.success,
        complaintsCount: data.data?.complaints?.length || 0,
        hasData: !!data.data
      });
    } else {
      const errorData = await response.json();
      console.log('❌ API Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testComplaintsAPI();
