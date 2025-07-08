#!/usr/bin/env node
/**
 * 🔍 SERVER-SIDE COOKIE AUDIT
 * 
 * This script tests what cookies are being set by the server
 * and identifies any potential issues with cookie management
 * after logout operations.
 */

const https = require('https');
const { URL } = require('url');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

function parseCookies(setCookieHeaders) {
  if (!setCookieHeaders) return [];
  
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  return headers.map(header => {
    const [nameValue, ...attributes] = header.split(';');
    const [name, value] = nameValue.split('=');
    return {
      name: name?.trim(),
      value: value?.trim(),
      attributes: attributes.map(attr => attr.trim())
    };
  });
}

async function serverSideCookieAudit() {
  console.log('🔍 === SERVER-SIDE COOKIE AUDIT ===\n');
  
  try {
    console.log('1️⃣ === TESTING LOGIN ENDPOINT ===');
    
    const loginResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    console.log(`📞 Login response: ${loginResponse.status}`);
    const loginCookies = parseCookies(loginResponse.headers['set-cookie']);
    console.log(`🍪 Cookies set by login: ${loginCookies.length}`);
    
    if (loginCookies.length > 0) {
      loginCookies.forEach(cookie => {
        console.log(`   🍪 ${cookie.name} = ${cookie.value?.substring(0, 30)}...`);
        console.log(`       Attributes: ${cookie.attributes.join(', ')}`);
      });
    }
    
    // Extract the auth cookie for subsequent requests
    const authCookie = loginCookies.find(c => c.name === 'pharmacy_auth');
    const cookieHeader = loginCookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    console.log('\n2️⃣ === TESTING AUTH STATUS ===');
    
    const authCheckResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, {
      headers: {
        'Cookie': cookieHeader
      }
    });
    
    console.log(`📞 Auth check response: ${authCheckResponse.status}`);
    console.log(`📄 Auth check data:`, JSON.parse(authCheckResponse.data || '{}'));
    
    console.log('\n3️⃣ === TESTING LOGOUT ENDPOINT ===');
    
    const logoutResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📞 Logout response: ${logoutResponse.status}`);
    const logoutCookies = parseCookies(logoutResponse.headers['set-cookie']);
    console.log(`🍪 Cookies set by logout: ${logoutCookies.length}`);
    
    if (logoutCookies.length > 0) {
      console.log('🔥 LOGOUT COOKIE DELETION HEADERS:');
      logoutCookies.forEach((cookie, index) => {
        console.log(`   ${index + 1}. ${cookie.name} = ${cookie.value || '[empty]'}`);
        console.log(`      Attributes: ${cookie.attributes.join(', ')}`);
        
        // Check if this is a proper deletion cookie
        const hasExpired = cookie.attributes.some(attr => 
          attr.includes('expires=Thu, 01 Jan 1970') || 
          attr.includes('Max-Age=0')
        );
        
        if (hasExpired) {
          console.log(`      ✅ DELETION COOKIE (expires in past)`);
        } else {
          console.log(`      🚨 NOT A DELETION COOKIE`);
        }
      });
    } else {
      console.log('⚠️  NO Set-Cookie headers in logout response');
    }
    
    console.log('\n4️⃣ === TESTING POST-LOGOUT AUTH STATUS ===');
    
    // Test with original cookies (should fail)
    const postLogoutAuthResponse = await makeRequest(`${PRODUCTION_URL}/api/auth/me`, {
      headers: {
        'Cookie': cookieHeader
      }
    });
    
    console.log(`📞 Post-logout auth check: ${postLogoutAuthResponse.status}`);
    if (postLogoutAuthResponse.status === 401) {
      console.log('✅ GOOD: Server properly rejects old cookies after logout');
    } else {
      console.log('🚨 ISSUE: Server still accepts old cookies after logout');
      console.log(`📄 Response:`, JSON.parse(postLogoutAuthResponse.data || '{}'));
    }
    
    console.log('\n5️⃣ === TESTING OTHER ENDPOINTS FOR COOKIE SETTING ===');
    
    const endpointsToTest = [
      '/api/auth/verify',
      '/api/seo?page=/',
      '/',
      '/auth/login'
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        const response = await makeRequest(`${PRODUCTION_URL}${endpoint}`);
        const cookies = parseCookies(response.headers['set-cookie']);
        
        console.log(`📍 ${endpoint}: ${response.status} - ${cookies.length} cookies`);
        if (cookies.length > 0) {
          cookies.forEach(cookie => {
            console.log(`   🍪 ${cookie.name} = ${cookie.value?.substring(0, 20)}...`);
          });
        }
      } catch (error) {
        console.log(`📍 ${endpoint}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n6️⃣ === CONCLUSION ===');
    
    if (logoutCookies.length > 0) {
      const deletionCookies = logoutCookies.filter(cookie => 
        cookie.attributes.some(attr => 
          attr.includes('expires=Thu, 01 Jan 1970') || 
          attr.includes('Max-Age=0')
        )
      );
      
      console.log(`✅ Server sends ${deletionCookies.length} deletion cookies on logout`);
      
      if (deletionCookies.length < logoutCookies.length) {
        console.log(`🚨 WARNING: ${logoutCookies.length - deletionCookies.length} non-deletion cookies also sent`);
      }
    } else {
      console.log('🚨 CRITICAL: No cookies sent by logout endpoint - nuclear deletion may not work server-side');
    }
    
    if (postLogoutAuthResponse.status === 401) {
      console.log('✅ Server-side session invalidation works correctly');
    } else {
      console.log('🚨 Server-side session invalidation may have issues');
    }
    
  } catch (error) {
    console.error('💥 Error during server-side audit:', error);
  }
}

// Run the audit
serverSideCookieAudit().catch(console.error);
