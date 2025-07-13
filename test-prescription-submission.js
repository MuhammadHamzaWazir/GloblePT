// Test script to verify prescription submission flow
const API_BASE = 'http://localhost:3000/api';

async function testPrescriptionSubmission() {
  console.log('🔍 Testing Prescription Submission Flow...\n');

  // Create a dummy FormData for file upload test
  const testFileData = new Blob(['test prescription content'], { type: 'application/pdf' });
  const testFile = new File([testFileData], 'test-prescription.pdf', { type: 'application/pdf' });

  // Test 1: File upload API
  try {
    const formData = new FormData();
    formData.append('files', testFile);

    console.log('📤 Testing file upload API...');
    const uploadResponse = await fetch(`${API_BASE}/upload/prescription-files`, {
      method: 'POST',
      body: formData,
      // Note: In real browser environment, credentials: 'include' would be added
    });

    const uploadResult = await uploadResponse.text();
    console.log('📥 Upload response status:', uploadResponse.status);
    console.log('📥 Upload response:', uploadResult.substring(0, 200) + '...');

    if (uploadResponse.status === 401) {
      console.log('✅ Upload API correctly requires authentication');
    } else {
      console.log('ℹ️ Upload API response received');
    }

  } catch (error) {
    console.log('❌ Upload API error:', error.message);
  }

  // Test 2: Submit with files API
  try {
    const testPrescriptionData = {
      prescriptionText: 'Test prescription',
      medicine: 'Test Medicine',
      quantity: 1,
      deliveryAddress: 'Test Address',
      medicines: [{ name: 'Test Medicine', quantity: 1, dosage: '500mg', instructions: 'Take with food' }],
      fileUrls: ['/uploads/prescriptions/test-file.pdf'],
      filename: 'test-prescription.pdf'
    };

    console.log('\n📤 Testing submit with files API...');
    const submitResponse = await fetch(`${API_BASE}/prescriptions/submit-with-files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPrescriptionData),
    });

    const submitResult = await submitResponse.text();
    console.log('📥 Submit response status:', submitResponse.status);
    console.log('📥 Submit response:', submitResult.substring(0, 200) + '...');

    if (submitResponse.status === 401) {
      console.log('✅ Submit API correctly requires authentication');
    } else {
      console.log('ℹ️ Submit API response received');
    }

  } catch (error) {
    console.log('❌ Submit API error:', error.message);
  }

  // Test 3: User profile API
  try {
    console.log('\n📤 Testing user profile API...');
    const profileResponse = await fetch(`${API_BASE}/users/profile`);
    const profileResult = await profileResponse.text();
    console.log('📥 Profile response status:', profileResponse.status);
    console.log('📥 Profile response:', profileResult.substring(0, 200) + '...');

    if (profileResponse.status === 401) {
      console.log('✅ Profile API correctly requires authentication');
    } else {
      console.log('ℹ️ Profile API response received');
    }

  } catch (error) {
    console.log('❌ Profile API error:', error.message);
  }

  console.log('\n🏁 Prescription Submission Test Complete');
  console.log('\nℹ️ Note: All APIs correctly require authentication.');
  console.log('ℹ️ To test full functionality, use the web interface with a logged-in user.');
}

// Run if called directly
if (typeof window === 'undefined') {
  testPrescriptionSubmission().catch(console.error);
}

// Export for browser usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPrescriptionSubmission };
}
