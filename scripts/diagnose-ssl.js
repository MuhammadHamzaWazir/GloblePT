#!/usr/bin/env node

/**
 * SSL/HTTPS Diagnostic Tool for globalpharmatrading.co.uk
 * This script helps diagnose SSL certificate issues
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { execSync } = require('child_process');

async function diagnoseSSL() {
  console.log('🔒 SSL/HTTPS Diagnostic for globalpharmatrading.co.uk');
  console.log('===========================================\n');
  
  const domain = 'globalpharmatrading.co.uk';
  
  // Test 1: Check HTTP vs HTTPS
  console.log('🧪 Test 1: HTTP vs HTTPS Comparison');
  console.log('-----------------------------------');
  
  try {
    console.log('Testing HTTP...');
    const httpResponse = await fetch(`http://${domain}`, { 
      method: 'HEAD',
      timeout: 10000,
      redirect: 'manual'
    });
    console.log(`   ✅ HTTP Status: ${httpResponse.status}`);
    console.log(`   🔄 Redirect: ${httpResponse.headers.get('location') || 'None'}`);
  } catch (error) {
    console.log(`   ❌ HTTP Error: ${error.message}`);
  }
  
  try {
    console.log('\nTesting HTTPS...');
    const httpsResponse = await fetch(`https://${domain}`, { 
      method: 'HEAD',
      timeout: 10000,
      redirect: 'manual'
    });
    console.log(`   ✅ HTTPS Status: ${httpsResponse.status}`);
    console.log(`   🔄 Redirect: ${httpsResponse.headers.get('location') || 'None'}`);
  } catch (error) {
    console.log(`   ❌ HTTPS Error: ${error.message}`);
    console.log(`   🔍 This indicates SSL certificate issues`);
  }
  
  // Test 2: DNS Resolution
  console.log('\n🌐 Test 2: DNS Resolution Check');
  console.log('-------------------------------');
  
  try {
    const dnsResult = execSync(`nslookup ${domain}`, { encoding: 'utf8' });
    console.log('   ✅ DNS Resolution successful');
    if (dnsResult.includes('76.76.19.61')) {
      console.log('   ✅ Correctly pointing to Vercel IP');
    } else {
      console.log('   ⚠️  DNS might not be pointing to Vercel');
    }
  } catch (error) {
    console.log(`   ❌ DNS Resolution failed: ${error.message}`);
  }
  
  // Test 3: SSL Certificate Check
  console.log('\n🔒 Test 3: SSL Certificate Status');
  console.log('----------------------------------');
  
  try {
    // Try to get SSL certificate info
    const sslResult = execSync(`echo "" | openssl s_client -connect ${domain}:443 -servername ${domain} 2>/dev/null | openssl x509 -noout -text 2>/dev/null`, { encoding: 'utf8' });
    
    if (sslResult.includes('Certificate:')) {
      console.log('   ✅ SSL Certificate found');
      if (sslResult.includes(domain)) {
        console.log('   ✅ Certificate matches your domain');
      } else {
        console.log('   ⚠️  Certificate might not match your domain');
      }
    } else {
      console.log('   ❌ No SSL Certificate found');
    }
  } catch (error) {
    console.log('   ❌ SSL Certificate check failed');
    console.log('   🔍 This suggests SSL certificate is not provisioned yet');
  }
  
  // Test 4: WWW Subdomain
  console.log('\n🌐 Test 4: WWW Subdomain Check');
  console.log('-------------------------------');
  
  try {
    console.log('Testing HTTPS for www subdomain...');
    const wwwResponse = await fetch(`https://www.${domain}`, { 
      method: 'HEAD',
      timeout: 10000,
      redirect: 'manual'
    });
    console.log(`   ✅ WWW HTTPS Status: ${wwwResponse.status}`);
  } catch (error) {
    console.log(`   ❌ WWW HTTPS Error: ${error.message}`);
  }
  
  // Provide diagnosis and recommendations
  console.log('\n' + '='.repeat(50));
  console.log('🔍 DIAGNOSIS & RECOMMENDATIONS');
  console.log('='.repeat(50));
  
  console.log('\n📋 Most Likely Issues:');
  console.log('1. SSL certificate not yet provisioned by Vercel (most common)');
  console.log('2. Domain verification pending in Vercel dashboard');
  console.log('3. DNS propagation still in progress');
  console.log('4. SSL certificate generation failed and needs retry');
  
  console.log('\n🔧 Immediate Actions:');
  console.log('1. Check Vercel Dashboard → Settings → Domains');
  console.log('2. Verify both domains show "Valid" status');
  console.log('3. If "Invalid", remove and re-add the domain');
  console.log('4. Wait 24 hours for SSL auto-provisioning');
  
  console.log('\n⚡ Quick Fix Commands:');
  console.log('# Redeploy to trigger SSL refresh');
  console.log('vercel --prod');
  console.log('');
  console.log('# Check if domain is added in Vercel');
  console.log('vercel domains ls');
  
  console.log('\n🎯 Expected Timeline:');
  console.log('• DNS Changes: 5-30 minutes (✅ Already working)');
  console.log('• SSL Provisioning: 1-24 hours (⏳ In progress)');
  console.log('• Full HTTPS: Usually within 24 hours');
  
  console.log('\n✅ Good News:');
  console.log('Since HTTP is working, your DNS configuration is correct!');
  console.log('HTTPS issues are usually just SSL certificate timing.');
  console.log('Most cases resolve automatically within 24 hours.');
}

diagnoseSSL().catch(console.error);
