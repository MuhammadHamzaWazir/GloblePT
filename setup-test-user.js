// Simple script to verify and create user via API endpoint
const https = require('https');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';
const TEST_EMAIL = 'mhamzawazir1996@gmail.com';
const TEST_PASSWORD = 'password123';

async function makeRequest(url, method = 'GET', data = null, cookies = '') {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Setup-Script',
        ...(cookies && { 'Cookie': cookies })
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body,
          cookies: res.headers['set-cookie'] || []
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function resetUserPassword() {
  console.log('🔄 Attempting to reset/create user for testing...');
  
  try {
    // Try to use the password reset API to set a known password
    console.log('Using admin reset password endpoint...');
    
    const resetResponse = await makeRequest(`${PRODUCTION_URL}/api/admin/reset-password`, 'POST', {
      email: TEST_EMAIL,
      newPassword: TEST_PASSWORD
    });
    
    console.log(`Reset password status: ${resetResponse.statusCode}`);
    console.log(`Reset password response: ${resetResponse.body}`);
    
    if (resetResponse.statusCode === 200) {
      console.log('✅ Password reset successful');
      return true;
    } else {
      console.log('❌ Password reset failed');
      return false;
    }
    
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
}

async function enableTwoFactor() {
  console.log('🔄 Attempting to enable 2FA for user...');
  
  try {
    const enable2FAResponse = await makeRequest(`${PRODUCTION_URL}/api/admin/enable-2fa`, 'POST', {
      email: TEST_EMAIL,
      enable: true
    });
    
    console.log(`Enable 2FA status: ${enable2FAResponse.statusCode}`);
    console.log(`Enable 2FA response: ${enable2FAResponse.body}`);
    
    if (enable2FAResponse.statusCode === 200) {
      console.log('✅ 2FA enabled successfully');
      return true;
    } else {
      console.log('❌ 2FA enable failed');
      return false;
    }
    
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return false;
  }
}

async function setupTestUser() {
  console.log('🚀 SETTING UP TEST USER FOR PRODUCTION');
  console.log('='.repeat(50));
  
  const passwordReset = await resetUserPassword();
  if (passwordReset) {
    const twoFAEnabled = await enableTwoFactor();
    
    if (twoFAEnabled) {
      console.log('\n✅ Test user setup complete!');
      console.log(`Email: ${TEST_EMAIL}`);
      console.log(`Password: ${TEST_PASSWORD}`);
      console.log('2FA: Enabled');
      console.log('\nYou can now test the login flow on the website.');
    }
  }
}

if (require.main === module) {
  setupTestUser();
}

module.exports = { setupTestUser };
