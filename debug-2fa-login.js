const axios = require('axios');

async function debug2FALogin() {
  console.log('🔍 Debugging 2FA login flow...');
  
  try {
    const loginResponse = await axios.post('https://globalpharmatrading.co.uk/api/auth/login', {
      email: 'mhamzawazir1996@gmail.com',
      password: 'Test123!'
    }, {
      maxRedirects: 0,
      validateStatus: () => true
    });
    
    console.log('Login Response:');
    console.log('Status:', loginResponse.status);
    console.log('Headers:', loginResponse.headers);
    console.log('Data:', JSON.stringify(loginResponse.data, null, 2));
    console.log('Set-Cookie headers:', loginResponse.headers['set-cookie'] || 'None');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debug2FALogin();
