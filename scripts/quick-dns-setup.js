#!/usr/bin/env node

/**
 * Quick DNS Setup Guide for globalpharmatrading.co.uk
 * Specific instructions for GoDaddy DNS configuration
 */

console.log('🌐 GoDaddy DNS Setup for globalpharmatrading.co.uk');
console.log('=================================================\n');

console.log('🎯 GOAL: Point your GoDaddy domain to Vercel hosting\n');

console.log('📋 STEP 1: ADD DOMAIN IN VERCEL');
console.log('--------------------------------');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Open: pharmacy-management-system project');
console.log('3. Settings → Domains → Add Domain');
console.log('4. Add: globalpharmatrading.co.uk');
console.log('5. Add: www.globalpharmatrading.co.uk');
console.log('6. Note: Status will show "Invalid" initially (normal)\n');

console.log('🌐 STEP 2: CONFIGURE GODADDY DNS');
console.log('--------------------------------');
console.log('1. Login to: https://godaddy.com');
console.log('2. My Products → globalpharmatrading.co.uk → DNS');
console.log('3. Delete existing A and CNAME records for @ and www');
console.log('4. Add these TWO records:\n');

console.log('   📝 RECORD 1 (Root Domain):');
console.log('   Type: A');
console.log('   Name: @');
console.log('   Value: 76.76.19.61');
console.log('   TTL: 1 Hour\n');

console.log('   📝 RECORD 2 (WWW Subdomain):');
console.log('   Type: CNAME');
console.log('   Name: www');
console.log('   Value: cname.vercel-dns.com');
console.log('   TTL: 1 Hour\n');

console.log('5. Save all changes in GoDaddy\n');

console.log('⏰ STEP 3: WAIT & VERIFY');
console.log('------------------------');
console.log('1. Wait 5-30 minutes for DNS propagation');
console.log('2. Check Vercel dashboard (should show "Valid")');
console.log('3. Visit: https://globalpharmatrading.co.uk');
console.log('4. Test login: admin@pharmacy.com / password123\n');

console.log('🧪 VERIFICATION COMMANDS');
console.log('------------------------');
console.log('Run these to check your DNS:');
console.log('');
console.log('# Check DNS resolution');
console.log('node scripts/check-dns.js globalpharmatrading.co.uk');
console.log('');
console.log('# Verify full deployment');
console.log('node scripts/verify-globalpharmatrading.js');
console.log('');

console.log('🎉 SUCCESS INDICATORS');
console.log('---------------------');
console.log('✅ Vercel shows domain as "Valid"');
console.log('✅ https://globalpharmatrading.co.uk loads');
console.log('✅ Login works with admin credentials');
console.log('✅ All pharmacy features functional\n');

console.log('📖 DETAILED GUIDES AVAILABLE:');
console.log('- GODADDY_DNS_SETUP_GUIDE.md (Step-by-step)');
console.log('- GODADDY_DNS_VISUAL_GUIDE.md (Visual reference)');
console.log('- DEPLOY_GLOBALPHARMATRADING_GUIDE.md (Complete guide)\n');

console.log('🚨 NEED HELP?');
console.log('If you encounter issues:');
console.log('1. Double-check DNS records match exactly');
console.log('2. Wait longer for DNS propagation');
console.log('3. Clear browser cache and try again');
console.log('4. Check guides above for troubleshooting\n');

console.log('🌟 Once complete: Your pharmacy system will be live at');
console.log('    https://globalpharmatrading.co.uk');
console.log('    with full functionality and professional appearance!');
