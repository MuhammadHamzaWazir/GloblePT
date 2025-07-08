#!/usr/bin/env node

/**
 * TEST PROFILE API WITHOUT TRAILING SLASH
 */

const https = require('https');

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testUrls() {
  const baseUrl = 'https://globalpharmatrading.co.uk';
  
  const urls = [
    '/api/users/profile/',  // with trailing slash
    '/api/users/profile'    // without trailing slash
  ];
  
  for (const url of urls) {
    try {
      console.log(`\n🧪 Testing: ${baseUrl}${url}`);
      const response = await makeRequest(`${baseUrl}${url}`);
      console.log(`   Status: ${response.statusCode}`);
      
      if (response.headers.location) {
        console.log(`   Redirects to: ${response.headers.location}`);
      }
      
      if (response.statusCode === 401) {
        console.log(`   ✅ Correct - Returns 401 for unauthenticated user`);
      } else if (response.statusCode === 308) {
        console.log(`   ⚠️  Redirect detected`);
      } else {
        console.log(`   ❓ Unexpected status`);
      }
      
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
    }
  }
}

testUrls().catch(console.error);
