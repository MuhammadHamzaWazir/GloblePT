#!/usr/bin/env node

/**
 * GoDaddy Domain Configuration Helper
 * This script helps you configure your GoDaddy domain for different deployment options
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌐 GoDaddy Domain Configuration Helper');
console.log('=====================================\n');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  try {
    console.log('Let\'s configure your GoDaddy domain for your pharmacy management system!\n');
    
    // Get domain information
    const domain = await askQuestion('🌍 What is your GoDaddy domain? (e.g., mypharmacy.com): ');
    if (!domain) {
      console.log('❌ Domain is required. Please run the script again.');
      rl.close();
      return;
    }
    
    console.log('\n📋 Choose your deployment option:');
    console.log('1. GoDaddy Domain → Vercel (RECOMMENDED - Full functionality)');
    console.log('2. GoDaddy VPS/Dedicated Server (Full functionality, more complex)');
    console.log('3. GoDaddy Shared Hosting (Limited functionality, static files only)');
    
    const option = await askQuestion('\n🔢 Enter your choice (1, 2, or 3): ');
    
    console.log('\n' + '='.repeat(60));
    
    switch(option) {
      case '1':
        showVercelInstructions(domain);
        break;
      case '2':
        showVPSInstructions(domain);
        break;
      case '3':
        showSharedHostingInstructions(domain);
        break;
      default:
        console.log('❌ Invalid option. Please run the script again and choose 1, 2, or 3.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('\n📖 For detailed instructions, see: GODADDY_DOMAIN_DEPLOYMENT_GUIDE.md');
    rl.close();
  }
}

function showVercelInstructions(domain) {
  console.log('🎯 OPTION 1: GoDaddy Domain → Vercel (RECOMMENDED)');
  console.log('================================================\n');
  
  console.log('✨ This gives you the BEST of both worlds:');
  console.log('   • Your custom domain (' + domain + ')');
  console.log('   • Full application functionality');
  console.log('   • Excellent performance and reliability');
  console.log('   • Free hosting on Vercel\n');
  
  console.log('🔧 STEP 1: Configure Vercel');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Open your pharmacy-management-system project');
  console.log('3. Go to Settings → Domains');
  console.log('4. Click "Add Domain"');
  console.log('5. Enter: ' + domain);
  console.log('6. Also add: www.' + domain);
  console.log('7. Note the DNS records Vercel provides\n');
  
  console.log('🌐 STEP 2: Configure GoDaddy DNS');
  console.log('1. Go to https://godaddy.com');
  console.log('2. My Products → DNS');
  console.log('3. Manage DNS for: ' + domain);
  console.log('4. Delete existing A and CNAME records');
  console.log('5. Add these records:\n');
  
  console.log('   📝 Root Domain Record:');
  console.log('   Type: A');
  console.log('   Name: @');
  console.log('   Value: 76.76.19.61');
  console.log('   TTL: 1 Hour\n');
  
  console.log('   📝 WWW Subdomain Record:');
  console.log('   Type: CNAME');
  console.log('   Name: www');
  console.log('   Value: cname.vercel-dns.com');
  console.log('   TTL: 1 Hour\n');
  
  console.log('⏰ STEP 3: Wait & Verify');
  console.log('1. Save changes in GoDaddy');
  console.log('2. Wait 5-30 minutes for DNS propagation');
  console.log('3. Check Vercel dashboard for domain verification');
  console.log('4. Visit: https://' + domain);
  console.log('5. Test login: admin@pharmacy.com / password123\n');
  
  console.log('🎉 Once complete, your pharmacy system will be live at:');
  console.log('   • https://' + domain);
  console.log('   • https://www.' + domain);
}

function showVPSInstructions(domain) {
  console.log('🖥️  OPTION 2: GoDaddy VPS/Dedicated Server');
  console.log('==========================================\n');
  
  console.log('⚠️  Requirements for this option:');
  console.log('   • GoDaddy VPS or Dedicated hosting plan');
  console.log('   • SSH access to your server');
  console.log('   • Node.js 18+ installed');
  console.log('   • MySQL database access\n');
  
  console.log('🔧 STEP 1: Server Setup');
  console.log('1. SSH into your GoDaddy VPS');
  console.log('2. Install Node.js if not already installed:');
  console.log('   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -');
  console.log('   sudo apt-get install -y nodejs');
  console.log('3. Install MySQL if not already installed\n');
  
  console.log('🚀 STEP 2: Upload Application');
  console.log('1. Upload your project files to the server');
  console.log('2. Navigate to project directory');
  console.log('3. Run: npm install');
  console.log('4. Create .env file with your VPS database details\n');
  
  console.log('🗄️  STEP 3: Database Setup');
  console.log('1. Create MySQL database: pharmacy_db');
  console.log('2. Update DATABASE_URL in .env');
  console.log('3. Run: npm run db:migrate:deploy');
  console.log('4. Run: npm run db:seed:prod\n');
  
  console.log('🌐 STEP 4: Configure Web Server');
  console.log('1. Set up Apache or Nginx proxy');
  console.log('2. Point ' + domain + ' to your VPS IP');
  console.log('3. Configure SSL certificate');
  console.log('4. Start the application: npm start\n');
  
  console.log('📋 DNS Configuration:');
  console.log('   Type: A');
  console.log('   Name: @');
  console.log('   Value: [Your VPS IP Address]');
  console.log('   TTL: 1 Hour');
}

function showSharedHostingInstructions(domain) {
  console.log('📁 OPTION 3: GoDaddy Shared Hosting (LIMITED)');
  console.log('===========================================\n');
  
  console.log('⚠️  IMPORTANT LIMITATIONS:');
  console.log('   ❌ No user login/authentication');
  console.log('   ❌ No database operations');
  console.log('   ❌ No API endpoints');
  console.log('   ❌ No prescription management');
  console.log('   ❌ No payment processing');
  console.log('   ✅ Only static pages work\n');
  
  console.log('📝 This option is NOT recommended for your pharmacy system');
  console.log('   because it requires server-side functionality.\n');
  
  console.log('🔄 Consider Option 1 (GoDaddy Domain → Vercel) instead:');
  console.log('   • Same custom domain (' + domain + ')');
  console.log('   • Full functionality');
  console.log('   • Better performance');
  console.log('   • Free hosting\n');
  
  console.log('🚀 If you still want static files:');
  console.log('1. Run: npm run build:static');
  console.log('2. Upload "out" folder contents to public_html');
  console.log('3. Configure ' + domain + ' to point to your shared hosting');
}

// Run the script
main().catch(console.error);
