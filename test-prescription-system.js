// Test script to verify prescription system functionality
const API_BASE = 'http://localhost:3000/api';

async function testPrescriptionSystem() {
  console.log('🔍 Testing Prescription System...\n');

  // Test 1: Check if upload API endpoint exists
  try {
    const response = await fetch(`${API_BASE}/upload/prescription-files`, {
      method: 'OPTIONS'
    });
    console.log('✅ Upload API endpoint accessible');
  } catch (error) {
    console.log('❌ Upload API endpoint error:', error.message);
  }

  // Test 2: Check if user profile API exists
  try {
    const response = await fetch(`${API_BASE}/users/profile`, {
      method: 'GET'
    });
    console.log('✅ User Profile API endpoint accessible');
  } catch (error) {
    console.log('❌ User Profile API endpoint error:', error.message);
  }

  // Test 3: Check if submit-with-files API exists
  try {
    const response = await fetch(`${API_BASE}/prescriptions/submit-with-files`, {
      method: 'OPTIONS'
    });
    console.log('✅ Submit with Files API endpoint accessible');
  } catch (error) {
    console.log('❌ Submit with Files API endpoint error:', error.message);
  }

  // Test 4: Check uploads directory structure
  const fs = require('fs');
  const path = require('path');
  
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'prescriptions');
  if (fs.existsSync(uploadsDir)) {
    console.log('✅ Uploads directory exists:', uploadsDir);
  } else {
    console.log('❌ Uploads directory missing:', uploadsDir);
  }

  console.log('\n🏁 Prescription System Test Complete');
}

// Run if called directly
if (require.main === module) {
  testPrescriptionSystem().catch(console.error);
}

module.exports = { testPrescriptionSystem };
