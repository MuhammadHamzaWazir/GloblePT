const fetch = require('node-fetch');

async function testFullGPDetailsFlow() {
  console.log('=== Testing Full GP Details Flow ===\n');
  
  try {
    // Step 1: Login to get authentication cookie
    console.log('1. Testing login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    console.log('Login status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.text();
      console.log('Login failed:', errorData);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.message);

    // Extract cookie from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies received:', cookies);

    if (!cookies) {
      console.log('No authentication cookie received!');
      return;
    }

    // Step 2: Test auth/me endpoint
    console.log('\n2. Testing auth/me...');
    const authResponse = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    console.log('Auth/me status:', authResponse.status);
    const authData = await authResponse.json();
    console.log('Auth/me response:', authData);

    if (!authData.authenticated) {
      console.log('Authentication check failed!');
      return;
    }

    // Step 3: Test GP details GET
    console.log('\n3. Testing GP details GET...');
    const getResponse = await fetch('http://localhost:3000/api/user/gp-details', {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    console.log('GP details GET status:', getResponse.status);
    const getData = await getResponse.json();
    console.log('GP details GET response:', getData);

    // Step 4: Test GP details POST
    console.log('\n4. Testing GP details POST...');
    const testGPData = {
      gpName: 'Dr. Test GP',
      gpAddress: '123 Test Medical Street, London, SW1A 1AA',
      gpPhone: '020 7946 0958',
      gpEmail: 'test.gp@nhs.uk',
      practiceName: 'Test Medical Practice',
      nhsNumber: '480 123 4567'
    };

    const postResponse = await fetch('http://localhost:3000/api/user/gp-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify(testGPData)
    });

    console.log('GP details POST status:', postResponse.status);
    const postData = await postResponse.json();
    console.log('GP details POST response:', postData);

    // Step 5: Verify the update
    console.log('\n5. Verifying update...');
    const verifyResponse = await fetch('http://localhost:3000/api/user/gp-details', {
      method: 'GET',
      headers: {
        'Cookie': cookies
      }
    });

    const verifyData = await verifyResponse.json();
    console.log('Verification response:', verifyData);

  } catch (error) {
    console.error('Test error:', error);
  }
}

testFullGPDetailsFlow();
