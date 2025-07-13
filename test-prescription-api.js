const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testPrescriptionAPI() {
  console.log('🧪 Testing Prescription API');
  console.log('=' .repeat(50));
  
  try {
    // Login as admin
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@globalpharmatrading.co.uk',
        password: 'Admin@2024'
      })
    });
    
    const loginResult = await loginResponse.json();
    console.log('Login result:', loginResult);
    
    const cookies = loginResponse.headers.get('set-cookie');
    const authCookie = cookies?.split(';')[0];
    console.log('Auth cookie:', authCookie);
    
    // Test prescription creation
    const prescriptionResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookie
      },
      body: JSON.stringify({
        medicine: 'Test Medicine',
        dosage: '1 tablet daily',
        quantity: 10,
        prescriptionText: 'Test Medicine - 1 tablet daily for 10 days',
        deliveryAddress: '123 Test Street, Test City, TC1 2TC',
        medicineType: 'P',
        requiresPrescription: false,
        ageRestricted: false,
        understandsRisks: true,
        canFollowInstructions: true,
        hasReadWarnings: true,
        confirmsNoAllergies: true
      })
    });
    
    console.log('Prescription response status:', prescriptionResponse.status);
    const prescriptionText = await prescriptionResponse.text();
    console.log('Prescription response:', prescriptionText);
    
    if (prescriptionResponse.ok) {
      const prescription = JSON.parse(prescriptionText);
      console.log('✅ Prescription created:', prescription.data.prescription.id);
      
      // Test approval
      const approvalResponse = await fetch(`${BASE_URL}/api/prescriptions/${prescription.data.prescription.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify({
          action: 'approve'
        })
      });
      
      console.log('Approval response status:', approvalResponse.status);
      const approvalText = await approvalResponse.text();
      console.log('Approval response:', approvalText);
      
      if (approvalResponse.ok) {
        console.log('✅ Prescription approved successfully');
      } else {
        console.log('❌ Prescription approval failed');
      }
    } else {
      console.log('❌ Prescription creation failed');
    }
    
  } catch (error) {
    console.error('❌ Error during prescription API test:', error);
  }
}

testPrescriptionAPI();
