#!/usr/bin/env node

/**
 * Verify globalpharmatrading.co.uk deployment
 * Quick check script for your specific domain
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function verifyDeployment() {
  console.log('🔍 Verifying globalpharmatrading.co.uk Deployment');
  console.log('==============================================\n');
  
  const domain = 'globalpharmatrading.co.uk';
  const urls = [
    `https://${domain}`,
    `https://www.${domain}`,
    `http://${domain}`,
    `http://www.${domain}`
  ];
  
  console.log('🌐 Testing domain accessibility...\n');
  
  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const response = await fetch(url, { 
        method: 'HEAD', 
        timeout: 10000,
        redirect: 'follow'
      });
      
      console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
      console.log(`   🔒 Protocol: ${new URL(response.url).protocol}`);
      console.log(`   🎯 Final URL: ${response.url}\n`);
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}\n`);
    }
  }
  
  // Test API endpoints
  console.log('🔧 Testing API endpoints...\n');
  const apiEndpoints = [
    '/api/health',
    '/api/users',
    '/api/prescriptions'
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const url = `https://${domain}${endpoint}`;
      console.log(`Testing API: ${endpoint}`);
      const response = await fetch(url, { 
        timeout: 5000,
        method: 'GET'
      });
      
      if (response.status === 401) {
        console.log(`   ✅ API responding (401 = auth required, which is correct)`);
      } else if (response.status === 200) {
        console.log(`   ✅ API responding successfully`);
      } else {
        console.log(`   ⚠️  API status: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ API failed: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📋 DEPLOYMENT STATUS SUMMARY');
  console.log('='.repeat(50));
  
  console.log('\n🎯 Primary URL: https://globalpharmatrading.co.uk');
  console.log('🔑 Admin Login: admin@pharmacy.com / password123');
  console.log('📱 Test on multiple devices and browsers');
  
  console.log('\n📞 If issues persist:');
  console.log('1. Wait for DNS propagation (up to 24 hours)');
  console.log('2. Clear browser cache');
  console.log('3. Check GoDaddy DNS settings');
  console.log('4. Verify Vercel domain configuration');
  
  console.log('\n🎉 Once working, your pharmacy system is live!');
}

verifyDeployment().catch(console.error);
