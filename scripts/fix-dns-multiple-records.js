#!/usr/bin/env node

/**
 * DNS Multiple Records Fix Script
 * Diagnoses and provides instructions for fixing multiple A records issue
 */

const dns = require('dns').promises;
const https = require('https');

const DOMAIN = 'globalpharmatrading.co.uk';
const CORRECT_VERCEL_IP = '76.76.21.21';

console.log('🔧 DNS Multiple Records Fix Script');
console.log('=====================================');

async function checkDNSRecords() {
    try {
        console.log(`\n🔍 Checking DNS A records for ${DOMAIN}...`);
        
        const addresses = await dns.resolve4(DOMAIN);
        console.log(`   Found ${addresses.length} A record(s):`);
        
        addresses.forEach((ip, index) => {
            const isCorrect = ip === CORRECT_VERCEL_IP;
            const status = isCorrect ? '✅ CORRECT' : '❌ INCORRECT';
            console.log(`   ${index + 1}. ${ip} ${status}`);
        });

        if (addresses.length > 1) {
            console.log('\n⚠️  PROBLEM DETECTED: Multiple A records found!');
            console.log('   This prevents SSL certificate from working properly.');
            
            const incorrectIPs = addresses.filter(ip => ip !== CORRECT_VERCEL_IP);
            if (incorrectIPs.length > 0) {
                console.log('\n🔧 ACTION REQUIRED:');
                console.log('   1. Login to your GoDaddy DNS management');
                console.log('   2. Find the DNS records for globalpharmatrading.co.uk');
                console.log('   3. DELETE the following incorrect A record(s):');
                incorrectIPs.forEach(ip => {
                    console.log(`      - A record pointing to: ${ip}`);
                });
                console.log(`   4. KEEP only the A record pointing to: ${CORRECT_VERCEL_IP}`);
                console.log('   5. Save changes and wait 5-15 minutes for propagation');
            }
        } else if (addresses.length === 1 && addresses[0] === CORRECT_VERCEL_IP) {
            console.log('\n✅ DNS Configuration is CORRECT!');
            console.log('   Only one A record pointing to the correct Vercel IP.');
        }

        return addresses;
    } catch (error) {
        console.error(`❌ Error checking DNS: ${error.message}`);
        return [];
    }
}

async function testSSLAfterFix() {
    console.log('\n🔒 Testing SSL Certificate Status...');
    
    return new Promise((resolve) => {
        const options = {
            hostname: DOMAIN,
            port: 443,
            path: '/',
            method: 'GET',
            timeout: 10000
        };

        const req = https.request(options, (res) => {
            console.log('   ✅ SSL Certificate is working!');
            console.log(`   Status: ${res.statusCode}`);
            resolve(true);
        });

        req.on('error', (error) => {
            if (error.code === 'CERT_HAS_EXPIRED') {
                console.log('   ❌ SSL Certificate has expired');
            } else if (error.code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
                console.log('   ⏳ SSL Certificate still being provisioned');
                console.log('   This should resolve within 24 hours');
            } else {
                console.log(`   ⏳ SSL not ready yet: ${error.message}`);
            }
            resolve(false);
        });

        req.on('timeout', () => {
            console.log('   ⏳ SSL connection timeout - still being provisioned');
            resolve(false);
        });

        req.end();
    });
}

async function triggerVercelSSLRefresh() {
    console.log('\n⚡ Next Steps After DNS Fix:');
    console.log('1. Wait 5-15 minutes for DNS propagation');
    console.log('2. Run: vercel --prod (to trigger SSL refresh)');
    console.log('3. Check Vercel dashboard for domain validation');
    console.log('4. SSL should be ready within 1-24 hours');
    console.log('\n📋 Commands to run after DNS fix:');
    console.log('   cd c:\\Users\\m_zee\\devWork\\pharmacy');
    console.log('   vercel --prod');
    console.log('   node scripts/diagnose-ssl.js');
}

async function main() {
    const addresses = await checkDNSRecords();
    await testSSLAfterFix();
    await triggerVercelSSLRefresh();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 SUMMARY');
    console.log('='.repeat(50));
    
    if (addresses.length > 1) {
        console.log('❌ Action Required: Remove incorrect DNS A records');
        console.log('⏳ Timeline: DNS fix (5-15 min) + SSL provisioning (1-24 hours)');
    } else if (addresses.length === 1 && addresses[0] === CORRECT_VERCEL_IP) {
        console.log('✅ DNS is correct - SSL should provision automatically');
        console.log('⏳ Timeline: SSL provisioning usually completes within 1-24 hours');
    }
    
    console.log('\n📞 Support:');
    console.log('If SSL doesn\'t work after 24 hours, contact Vercel support');
    console.log('or re-run this script to check status.');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { checkDNSRecords, testSSLAfterFix };
