#!/usr/bin/env node
/**
 * 🔍 SIMPLIFIED COOKIE AUDIT
 * 
 * This script tests the production site to identify any sources
 * of cookie re-addition after logout.
 */

const fetch = require('node-fetch');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

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

async function simpleCookieAudit() {
  console.log('🔍 === SIMPLIFIED COOKIE AUDIT ===\n');
  
  try {
    console.log('1️⃣ === TESTING LOGOUT ENDPOINT DIRECTLY ===');
    
    // Just test the logout endpoint to see what cookies it sends
    const logoutResponse = await fetch(`${PRODUCTION_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'pharmacy_auth=test_token_value' // Fake token to test deletion
      }
    });
    
    console.log(`📞 Logout response: ${logoutResponse.status}`);
    
    const setCookieHeaders = logoutResponse.headers.get('set-cookie');
    console.log(`🍪 Raw Set-Cookie header:`, setCookieHeaders || 'None');
    
    if (setCookieHeaders) {
      const cookies = parseCookies(setCookieHeaders);
      console.log(`🔥 Logout sends ${cookies.length} cookie deletion commands:`);
      
      cookies.forEach((cookie, index) => {
        console.log(`   ${index + 1}. ${cookie.name} = ${cookie.value || '[empty]'}`);
        console.log(`      Attributes: ${cookie.attributes.join(', ')}`);
        
        const hasExpired = cookie.attributes.some(attr => 
          attr.includes('expires=Thu, 01 Jan 1970') || 
          attr.includes('Max-Age=0')
        );
        
        if (hasExpired) {
          console.log(`      ✅ DELETION COOKIE (expires in past)`);
        } else {
          console.log(`      🚨 NOT A DELETION COOKIE - MAY RE-ADD!`);
        }
      });
    } else {
      console.log('🚨 CRITICAL: Logout endpoint sends NO Set-Cookie headers');
    }
    
    console.log('\n2️⃣ === TESTING COMMON ENDPOINTS FOR UNWANTED COOKIES ===');
    
    const endpointsToTest = [
      { path: '/', name: 'Homepage' },
      { path: '/auth/login', name: 'Login Page' },
      { path: '/api/auth/me', name: 'Auth Check' },
      { path: '/api/seo?page=/', name: 'SEO API' }
    ];
    
    for (const endpoint of endpointsToTest) {
      try {
        const response = await fetch(`${PRODUCTION_URL}${endpoint.path}`);
        const setCookies = response.headers.get('set-cookie');
        
        console.log(`📍 ${endpoint.name} (${endpoint.path}): ${response.status}`);
        
        if (setCookies) {
          const cookies = parseCookies(setCookies);
          console.log(`   🚨 SETS ${cookies.length} COOKIES:`);
          cookies.forEach(cookie => {
            console.log(`      🍪 ${cookie.name} = ${cookie.value?.substring(0, 30)}...`);
          });
        } else {
          console.log(`   ✅ No cookies set`);
        }
      } catch (error) {
        console.log(`   ❌ ERROR: ${error.message}`);
      }
    }
    
    console.log('\n3️⃣ === RECOMMENDATIONS ===');
    
    if (setCookieHeaders) {
      console.log('✅ Server-side cookie deletion is active in logout endpoint');
      console.log('✅ Nuclear deletion should work properly');
    } else {
      console.log('🚨 Server-side cookie deletion is NOT working');
      console.log('💡 Check /api/auth/logout/route.ts for issues');
    }
    
    console.log('\n🎯 If cookies are still persisting after logout:');
    console.log('   1. Check browser developer tools → Application → Cookies');
    console.log('   2. Look for any third-party services (reCAPTCHA, analytics, etc.)');
    console.log('   3. Check if any JavaScript is running after logout that sets cookies');
    console.log('   4. Verify the nuclear deletion function is being called client-side');
    
  } catch (error) {
    console.error('💥 Error during audit:', error.message);
  }
}

// Check if node-fetch is available, if not provide instructions
try {
  require('node-fetch');
  simpleCookieAudit().catch(console.error);
} catch (error) {
  console.log('⚠️  node-fetch not found. Installing...');
  console.log('Run: npm install node-fetch@2');
}
