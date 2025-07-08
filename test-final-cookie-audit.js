#!/usr/bin/env node
/**
 * 🔍 FINAL COMPREHENSIVE COOKIE AUDIT
 * 
 * This script performs a complete audit of what cookies are being set
 * after logout, focusing on identifying ANY source that might be
 * re-adding cookies after our nuclear deletion process.
 */

import { chromium } from 'playwright';

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function comprehensiveCookieAudit() {
  console.log('🔍 === FINAL COMPREHENSIVE COOKIE AUDIT ===\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Use headful to see what's happening
    slowMo: 1000     // Slow down actions for observation
  });
  
  const context = await browser.newContext({
    // Enable JavaScript debugging
    javaScriptEnabled: true,
  });
  
  const page = await context.newPage();
  
  // Intercept ALL network requests to see if any are setting cookies
  const networkLogs = [];
  page.on('response', async (response) => {
    const headers = response.headers();
    if (headers['set-cookie']) {
      networkLogs.push({
        url: response.url(),
        status: response.status(),
        setCookie: headers['set-cookie']
      });
    }
  });
  
  // Monitor console logs for any cookie-related activity
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('cookie') || text.includes('auth') || text.includes('pharmacy')) {
      console.log(`🖥️  Browser Console: ${text}`);
    }
  });
  
  try {
    console.log('1️⃣ === INITIAL PAGE LOAD ===');
    await page.goto(PRODUCTION_URL);
    await page.waitForTimeout(2000);
    
    let initialCookies = await page.context().cookies();
    console.log(`📊 Initial cookies found: ${initialCookies.length}`);
    if (initialCookies.length > 0) {
      initialCookies.forEach(cookie => {
        console.log(`   🍪 ${cookie.name} = ${cookie.value.substring(0, 50)}...`);
      });
    }
    
    console.log('\n2️⃣ === LOGIN PROCESS ===');
    await page.goto(`${PRODUCTION_URL}/auth/login`);
    await page.waitForTimeout(1000);
    
    // Login with test credentials
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    
    let afterLoginCookies = await page.context().cookies();
    console.log(`📊 Cookies after login: ${afterLoginCookies.length}`);
    afterLoginCookies.forEach(cookie => {
      console.log(`   🍪 ${cookie.name} = ${cookie.value.substring(0, 50)}...`);
    });
    
    console.log('\n3️⃣ === LOGOUT PROCESS ===');
    
    // First, let's manually call the logout API and monitor the response
    const logoutResponse = await page.evaluate(async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        text: await response.text()
      };
    });
    
    console.log(`📞 Logout API response: ${logoutResponse.status}`);
    console.log(`🍪 Set-Cookie headers:`, logoutResponse.headers['set-cookie'] || 'None');
    
    // Wait a moment for cookies to be processed
    await page.waitForTimeout(2000);
    
    let afterLogoutApiCookies = await page.context().cookies();
    console.log(`📊 Cookies after logout API call: ${afterLogoutApiCookies.length}`);
    if (afterLogoutApiCookies.length > 0) {
      afterLogoutApiCookies.forEach(cookie => {
        console.log(`   🍪 ${cookie.name} = ${cookie.value.substring(0, 50)}...`);
      });
    }
    
    console.log('\n4️⃣ === CLIENT-SIDE NUCLEAR DELETION ===');
    
    // Now run our nuclear deletion client-side
    await page.evaluate(() => {
      // This should match our nukeAllCookies function
      const cookieNames = [
        'pharmacy_auth', 'token', 'session', 'auth_token', 'user_session', 
        'access_token', 'refresh_token', 'jwt_token', 'sid', 'sessionid',
        'PHPSESSID', 'JSESSIONID', 'ASP.NET_SessionId', 'laravel_session',
        'connect.sid', '_session', '__session', 'next-auth.session-token',
        '__Secure-pharmacy_auth', '__Host-pharmacy_auth'
      ];
      
      const domains = ['', '.globalpharmatrading.co.uk', 'globalpharmatrading.co.uk', 'localhost'];
      const paths = ['/', '/auth', '/dashboard', '/api'];
      
      console.log('🔥 STARTING CLIENT-SIDE NUCLEAR DELETION');
      
      let attemptCount = 0;
      
      cookieNames.forEach(cookieName => {
        domains.forEach(domain => {
          paths.forEach(path => {
            // Basic deletion
            try {
              document.cookie = `${cookieName}=; Path=${path}; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0`;
              document.cookie = `${cookieName}=; Path=${path}; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Secure`;
              document.cookie = `${cookieName}=; Path=${path}; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; HttpOnly`;
              document.cookie = `${cookieName}=; Path=${path}; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; Secure; HttpOnly`;
              attemptCount += 4;
            } catch (e) {
              // Continue
            }
          });
        });
      });
      
      console.log(`🔥 CLIENT-SIDE NUCLEAR DELETION COMPLETE: ${attemptCount} attempts`);
      
      // Clear all storage
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('🧹 Storage cleared');
      } catch (e) {
        console.warn('⚠️ Could not clear storage:', e);
      }
    });
    
    await page.waitForTimeout(2000);
    
    let afterNuclearCookies = await page.context().cookies();
    console.log(`📊 Cookies after nuclear deletion: ${afterNuclearCookies.length}`);
    if (afterNuclearCookies.length > 0) {
      afterNuclearCookies.forEach(cookie => {
        console.log(`   🚨 SURVIVED NUCLEAR DELETION: ${cookie.name} = ${cookie.value.substring(0, 50)}...`);
      });
    }
    
    console.log('\n5️⃣ === WAITING AND MONITORING FOR COOKIE RE-ADDITION ===');
    
    // Wait for 10 seconds and monitor for any new cookies being set
    const monitoringPeriod = 10000; // 10 seconds
    const checkInterval = 1000; // Check every second
    
    for (let i = 0; i < monitoringPeriod / checkInterval; i++) {
      await page.waitForTimeout(checkInterval);
      
      let currentCookies = await page.context().cookies();
      if (currentCookies.length > afterNuclearCookies.length) {
        console.log(`🚨 NEW COOKIES DETECTED at ${i + 1} seconds after nuclear deletion:`);
        currentCookies.forEach(cookie => {
          const wasPresent = afterNuclearCookies.some(c => c.name === cookie.name);
          if (!wasPresent) {
            console.log(`   🆕 NEWLY ADDED: ${cookie.name} = ${cookie.value.substring(0, 50)}...`);
          }
        });
        afterNuclearCookies = currentCookies; // Update our baseline
      }
    }
    
    console.log('\n6️⃣ === FINAL COOKIE STATE ===');
    let finalCookies = await page.context().cookies();
    console.log(`📊 Final cookies: ${finalCookies.length}`);
    
    if (finalCookies.length === 0) {
      console.log('✅ SUCCESS: No cookies remain after nuclear deletion!');
    } else {
      console.log('🚨 ISSUE: The following cookies persisted or were re-added:');
      finalCookies.forEach(cookie => {
        console.log(`   🍪 ${cookie.name} = ${cookie.value.substring(0, 50)}...`);
        console.log(`       Domain: ${cookie.domain}, Path: ${cookie.path}, Secure: ${cookie.secure}, HttpOnly: ${cookie.httpOnly}`);
      });
    }
    
    console.log('\n7️⃣ === NETWORK ACTIVITY ANALYSIS ===');
    if (networkLogs.length > 0) {
      console.log('🌐 Network requests that set cookies:');
      networkLogs.forEach((log, index) => {
        console.log(`   ${index + 1}. ${log.url} (${log.status})`);
        console.log(`      Set-Cookie: ${log.setCookie}`);
      });
    } else {
      console.log('✅ No network requests set cookies during this session');
    }
    
  } catch (error) {
    console.error('💥 Error during audit:', error);
  } finally {
    await browser.close();
  }
}

// Run the audit
comprehensiveCookieAudit().catch(console.error);
