#!/usr/bin/env node

/**
 * DNS Configuration Checker for GoDaddy Domain
 * This script helps verify your DNS settings are correct
 */

const { execSync } = require('child_process');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function checkDNS(domain) {
  console.log('🔍 DNS Configuration Checker');
  console.log('============================\n');
  console.log(`Checking DNS for: ${domain}\n`);
  
  try {
    // Check A record
    console.log('📋 Checking A Record...');
    try {
      const aRecord = execSync(`nslookup ${domain}`, { encoding: 'utf8' });
      console.log(`✅ A Record found for ${domain}`);
      console.log(aRecord);
    } catch (error) {
      console.log(`❌ A Record not found for ${domain}`);
      console.log('   Make sure you have an A record pointing to Vercel IP: 76.76.19.61\n');
    }
    
    // Check CNAME record for www
    console.log('📋 Checking WWW CNAME Record...');
    try {
      const cnameRecord = execSync(`nslookup www.${domain}`, { encoding: 'utf8' });
      console.log(`✅ CNAME Record found for www.${domain}`);
      console.log(cnameRecord);
    } catch (error) {
      console.log(`❌ CNAME Record not found for www.${domain}`);
      console.log('   Make sure you have a CNAME record for www pointing to: cname.vercel-dns.com\n');
    }
    
    // Check HTTP response
    console.log('🌐 Checking HTTP Response...');
    try {
      const response = await fetch(`http://${domain}`, { 
        method: 'HEAD',
        timeout: 10000
      });
      console.log(`✅ HTTP response: ${response.status} ${response.statusText}`);
      
      if (response.status === 200) {
        console.log('🎉 Your domain is working correctly!');
      } else if (response.status === 301 || response.status === 302) {
        console.log('🔄 Domain is redirecting (this is normal for HTTPS)');
      } else {
        console.log('⚠️  Unexpected response code');
      }
    } catch (error) {
      console.log(`❌ HTTP check failed: ${error.message}`);
      console.log('   This might be normal if DNS is still propagating\n');
    }
    
    // Check HTTPS response
    console.log('🔒 Checking HTTPS Response...');
    try {
      const httpsResponse = await fetch(`https://${domain}`, { 
        method: 'HEAD',
        timeout: 10000
      });
      console.log(`✅ HTTPS response: ${httpsResponse.status} ${httpsResponse.statusText}`);
      
      if (httpsResponse.status === 200) {
        console.log('🎉 Your HTTPS domain is working correctly!');
        console.log(`🌟 Your pharmacy system should be accessible at: https://${domain}`);
      }
    } catch (error) {
      console.log(`❌ HTTPS check failed: ${error.message}`);
      console.log('   SSL certificate might still be provisioning\n');
    }
    
    // Provide recommendations
    console.log('\n' + '='.repeat(50));
    console.log('📋 RECOMMENDATIONS');
    console.log('='.repeat(50));
    
    console.log('\n🔧 If your domain is not working:');
    console.log('1. Wait 30 minutes for DNS propagation');
    console.log('2. Clear your browser cache');
    console.log('3. Try accessing from a different device/network');
    console.log('4. Check your GoDaddy DNS settings match these:');
    console.log('\n   A Record:');
    console.log('   Type: A, Name: @, Value: 76.76.19.61');
    console.log('\n   CNAME Record:');
    console.log('   Type: CNAME, Name: www, Value: cname.vercel-dns.com');
    
    console.log('\n🎯 Test URLs:');
    console.log(`   • http://${domain}`);
    console.log(`   • https://${domain}`);
    console.log(`   • https://www.${domain}`);
    
    console.log('\n🔑 Test Login:');
    console.log('   Email: admin@pharmacy.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ DNS check failed:', error.message);
  }
}

// Get domain from command line argument
const domain = process.argv[2];

if (!domain) {
  console.log('❌ Please provide a domain name');
  console.log('Usage: node scripts/check-dns.js yourdomain.com');
  process.exit(1);
}

checkDNS(domain).catch(console.error);
