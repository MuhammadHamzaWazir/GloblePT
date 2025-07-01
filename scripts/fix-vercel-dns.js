#!/usr/bin/env node

console.log('🔧 Vercel DNS Configuration Fix');
console.log('=================================');
console.log('');

console.log('📋 ISSUE IDENTIFIED:');
console.log('Your GoDaddy DNS A record points to: 76.76.19.61');
console.log('But Vercel expects it to point to: 76.76.21.21');
console.log('');

console.log('🎯 SOLUTION - Update GoDaddy DNS:');
console.log('1. Go to: https://dcc.godaddy.com/manage/dns');
console.log('2. Find your A record for @ (or globalpharmatrading.co.uk)');
console.log('3. Change the IP address from: 76.76.19.61');
console.log('4. Change it to: 76.76.21.21');
console.log('5. Save the changes');
console.log('');

console.log('⏰ ALTERNATIVE - Let Vercel manage DNS:');
console.log('1. Go to your Vercel dashboard');
console.log('2. Go to Settings → Domains');
console.log('3. Remove the current domain');
console.log('4. Re-add it and choose "Use Vercel nameservers"');
console.log('5. Update GoDaddy to use Vercel nameservers:');
console.log('   - ns43.domaincontrol.com → ns1.vercel-dns.com');
console.log('   - ns44.domaincontrol.com → ns2.vercel-dns.com');
console.log('');

console.log('🚀 RECOMMENDED APPROACH (Quick Fix):');
console.log('Just update the A record IP to: 76.76.21.21');
console.log('This should fix both HTTP and HTTPS issues.');
console.log('');

console.log('🔍 After making changes, wait 5-10 minutes then run:');
console.log('node scripts/verify-globalpharmatrading.js');
console.log('');

console.log('✅ Once DNS is fixed, HTTPS should work within 1-24 hours.');
