const fetch = require('node-fetch');

async function testAdminLogin() {
  console.log('🔍 Testing Admin Login Flow...\n');

  try {
    // Test admin login
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@globalpharmatrading.co.uk',
        password: 'admin123'
      })
    });

    console.log('🔑 Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('🔑 Login data:', loginData);
      
      if (loginData.success) {
        console.log('✅ Admin login successful');
        
        // Extract cookie from response
        const cookies = loginResponse.headers.raw()['set-cookie'];
        console.log('🍪 Cookies:', cookies);
        
        if (cookies && cookies.length > 0) {
          const authCookie = cookies.find(cookie => cookie.includes('pharmacy_auth'));
          console.log('🍪 Auth cookie:', authCookie);
          
          if (authCookie) {
            // Extract token from cookie
            const tokenMatch = authCookie.match(/pharmacy_auth=([^;]+)/);
            if (tokenMatch) {
              const token = tokenMatch[1];
              console.log('🔑 Token extracted:', token.substring(0, 50) + '...');
              
              // Test with the extracted token
              const testResponse = await fetch('http://localhost:3000/api/admin/complaints', {
                method: 'GET',
                headers: {
                  'Cookie': `pharmacy_auth=${token}`
                }
              });
              
              console.log('📋 Test complaints response:', testResponse.status);
              
              if (testResponse.ok) {
                const testData = await testResponse.json();
                console.log('📋 Test data:', testData.data?.complaints?.length || 0, 'complaints');
              } else {
                const errorText = await testResponse.text();
                console.log('❌ Test error:', errorText);
              }
            }
          }
        }
      } else {
        console.log('❌ Login failed:', loginData.message);
      }
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login error:', errorText);
    }

    console.log('\n🎯 SOLUTION:');
    console.log('============');
    console.log('1. Go to: http://localhost:3000/auth/login');
    console.log('2. Login with: admin@globalpharmatrading.co.uk / admin123');
    console.log('3. After successful login, go to: http://localhost:3000/admin/dashboard/complaints');
    console.log('4. The page should now show complaints data');

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  }
}

testAdminLogin();
