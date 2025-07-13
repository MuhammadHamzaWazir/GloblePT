const fetch = require('node-fetch');

async function testRealTimeAuth() {
  console.log('🔍 Testing Current Browser Session...\n');

  try {
    // Test the auth/me endpoint without any token (simulating browser request)
    const authResponse = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      credentials: 'include'
    });

    console.log('🔐 Auth/me response status:', authResponse.status);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('🔐 Auth data:', authData);
      
      if (authData.authenticated) {
        console.log('✅ User is authenticated');
        
        // Test admin complaints endpoint
        const complaintsResponse = await fetch('http://localhost:3000/api/admin/complaints', {
          method: 'GET',
          credentials: 'include'
        });

        console.log('📋 Admin complaints response status:', complaintsResponse.status);
        
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json();
          console.log('📋 Complaints data:', complaintsData);
        } else {
          const errorText = await complaintsResponse.text();
          console.log('❌ Admin complaints error:', errorText);
        }
      } else {
        console.log('❌ User is not authenticated');
      }
    } else {
      const errorText = await authResponse.text();
      console.log('❌ Auth error:', errorText);
    }

  } catch (error) {
    console.error('❌ Error testing auth:', error);
  }
}

testRealTimeAuth();
