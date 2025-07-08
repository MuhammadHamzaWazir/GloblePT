#!/usr/bin/env node
/**
 * 🔍 COMPREHENSIVE SET-COOKIE HEADER ANALYZER
 * 
 * This script examines ALL Set-Cookie headers sent by the logout endpoint
 * to verify our nuclear deletion is working properly.
 */

const fetch = require('node-fetch');

const PRODUCTION_URL = 'https://globalpharmatrading.co.uk';

async function analyzeSetCookieHeaders() {
  console.log('🔍 === COMPREHENSIVE SET-COOKIE HEADER ANALYZER ===\n');
  
  try {
    console.log('📞 Calling logout endpoint...');
    
    const logoutResponse = await fetch(`${PRODUCTION_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'pharmacy_auth=fake_test_token_for_deletion' // Provide a test token
      }
    });
    
    console.log(`📊 Response Status: ${logoutResponse.status}`);
    console.log(`📊 Response OK: ${logoutResponse.ok}`);
    
    // Get ALL headers
    const headers = {};
    logoutResponse.headers.forEach((value, key) => {
      if (!headers[key]) {
        headers[key] = [];
      }
      headers[key].push(value);
    });
    
    console.log('\n🔍 === ALL RESPONSE HEADERS ===');
    for (const [headerName, values] of Object.entries(headers)) {
      if (headerName.toLowerCase().includes('cookie')) {
        console.log(`📋 ${headerName}:`);
        values.forEach((value, index) => {
          console.log(`   ${index + 1}. ${value}`);
        });
      }
    }
    
    // Specifically look for Set-Cookie headers
    const setCookieHeaders = logoutResponse.headers.raw()['set-cookie'] || [];
    
    console.log(`\n🍪 === SET-COOKIE ANALYSIS ===`);
    console.log(`📊 Total Set-Cookie headers: ${setCookieHeaders.length}`);
    
    if (setCookieHeaders.length === 0) {
      console.log('🚨 CRITICAL: NO Set-Cookie headers found!');
      console.log('💡 This means server-side nuclear deletion is not working');
      return;
    }
    
    // Analyze each Set-Cookie header
    const cookieAnalysis = {};
    let deletionCount = 0;
    let nonDeletionCount = 0;
    
    setCookieHeaders.forEach((header, index) => {
      console.log(`\n🍪 Header ${index + 1}: ${header.substring(0, 100)}${header.length > 100 ? '...' : ''}`);
      
      // Parse cookie name
      const cookieName = header.split('=')[0];
      const value = header.split('=')[1]?.split(';')[0] || '';
      
      if (!cookieAnalysis[cookieName]) {
        cookieAnalysis[cookieName] = [];
      }
      cookieAnalysis[cookieName].push(header);
      
      // Check if this is a deletion cookie
      const isDeletion = (
        header.includes('expires=Thu, 01 Jan 1970') ||
        header.includes('Expires=Thu, 01 Jan 1970') ||
        header.includes('Max-Age=0') ||
        header.includes('max-age=0') ||
        (value === '' || value === 'deleted' || value === 'DELETED')
      );
      
      if (isDeletion) {
        console.log(`   ✅ DELETION COOKIE (${cookieName})`);
        deletionCount++;
      } else {
        console.log(`   🚨 NON-DELETION COOKIE (${cookieName}) - VALUE: ${value}`);
        nonDeletionCount++;
      }
      
      // Check for specific attributes
      const attributes = {
        path: header.match(/Path=([^;]+)/i)?.[1] || 'none',
        domain: header.match(/Domain=([^;]+)/i)?.[1] || 'none',
        secure: header.includes('Secure'),
        httpOnly: header.includes('HttpOnly'),
        sameSite: header.match(/SameSite=([^;]+)/i)?.[1] || 'none'
      };
      
      console.log(`      Path: ${attributes.path}, Domain: ${attributes.domain}`);
      console.log(`      Secure: ${attributes.secure}, HttpOnly: ${attributes.httpOnly}, SameSite: ${attributes.sameSite}`);
    });
    
    console.log(`\n📊 === SUMMARY ===`);
    console.log(`🔥 Deletion cookies: ${deletionCount}`);
    console.log(`🚨 Non-deletion cookies: ${nonDeletionCount}`);
    console.log(`📋 Unique cookie names: ${Object.keys(cookieAnalysis).length}`);
    
    console.log(`\n🍪 === COOKIE NAME BREAKDOWN ===`);
    for (const [cookieName, headers] of Object.entries(cookieAnalysis)) {
      console.log(`📌 ${cookieName}: ${headers.length} deletion attempts`);
      if (headers.length > 1) {
        console.log(`   💪 Multiple strategies used (good for nuclear deletion)`);
      }
    }
    
    // Final assessment
    console.log(`\n🎯 === ASSESSMENT ===`);
    
    if (deletionCount > 50) {
      console.log('✅ EXCELLENT: Nuclear deletion is working with many deletion attempts');
    } else if (deletionCount > 10) {
      console.log('✅ GOOD: Multiple deletion attempts detected');
    } else if (deletionCount > 0) {
      console.log('⚠️  MINIMAL: Some deletion attempts, but may not be comprehensive enough');
    }
    
    if (nonDeletionCount > 0) {
      console.log('🚨 WARNING: Some non-deletion cookies detected - these may re-add cookies!');
    }
    
    if (Object.keys(cookieAnalysis).includes('pharmacy_auth')) {
      console.log('✅ PRIMARY AUTH COOKIE (pharmacy_auth) deletion detected');
    } else {
      console.log('🚨 PRIMARY AUTH COOKIE (pharmacy_auth) deletion NOT detected');
    }
    
    // Recommendations
    console.log(`\n💡 === RECOMMENDATIONS ===`);
    
    if (deletionCount === 0) {
      console.log('🚨 CRITICAL: Server-side nuclear deletion is completely broken');
      console.log('   → Check /src/app/api/auth/logout/route.ts');
      console.log('   → Verify the nuclear deletion code is being executed');
    } else if (deletionCount < 20) {
      console.log('⚠️  Server-side nuclear deletion may be incomplete');
      console.log('   → Verify all cookie names are in the deletion list');
      console.log('   → Check if all nuclear strategies are being applied');
    } else {
      console.log('✅ Server-side nuclear deletion appears to be working');
      console.log('   → If cookies still persist, the issue is likely client-side');
      console.log('   → Check browser-based cookie deletion and third-party scripts');
    }
    
  } catch (error) {
    console.error('💥 Error during analysis:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the analysis
analyzeSetCookieHeaders().catch(console.error);
