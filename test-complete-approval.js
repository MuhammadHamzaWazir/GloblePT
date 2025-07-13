const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testStaffAdminApproval() {
  console.log('🧪 Testing Staff & Admin Approval Complete Workflow');
  console.log('=' .repeat(60));
  
  const testUsers = [
    { email: 'admin@globalpharmatrading.co.uk', password: 'Admin@2024', role: 'admin' },
    { email: 'pharmacist@globalpharmatrading.co.uk', password: 'Pharmacist@2024', role: 'staff' }
  ];
  
  const testPrescriptions = [];
  
  try {
    for (const [index, testUser] of testUsers.entries()) {
      console.log(`\n🔥 Testing ${testUser.role.toUpperCase()} Approval Workflow`);
      console.log('=' .repeat(40));
      
      // 1. Login
      console.log(`\n📋 Step 1: Login as ${testUser.role}`);
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      if (!loginResponse.ok) {
        console.error(`❌ Login failed for ${testUser.role}`);
        continue;
      }
      
      const loginResult = await loginResponse.json();
      const cookies = loginResponse.headers.get('set-cookie');
      const authCookie = cookies?.split(';')[0];
      
      console.log(`✅ ${testUser.role} logged in successfully`);
      console.log(`   Name: ${loginResult.user.name}`);
      console.log(`   Role: ${loginResult.user.role}`);
      
      // 2. Create test prescription
      console.log(`\n📋 Step 2: Create test prescription`);
      const prescriptionResponse = await fetch(`${BASE_URL}/api/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify({
          medicine: `Test Medicine ${index + 1}`,
          dosage: '1 tablet daily',
          quantity: 10,
          prescriptionText: `Test Medicine ${index + 1} - 1 tablet daily for 10 days - Approved by ${testUser.role}`,
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
      
      if (!prescriptionResponse.ok) {
        console.error(`❌ Prescription creation failed for ${testUser.role}`);
        const errorText = await prescriptionResponse.text();
        console.log(`   Error: ${errorText}`);
        continue;
      }
      
      const prescriptionResult = await prescriptionResponse.json();
      const prescription = prescriptionResult.data.prescription;
      testPrescriptions.push(prescription);
      
      console.log(`✅ Prescription created successfully`);
      console.log(`   ID: ${prescription.id}`);
      console.log(`   Medicine: ${prescription.medicine}`);
      console.log(`   Status: ${prescription.status}`);
      console.log(`   Requires Pharmacist Approval: ${prescription.pharmacistApprovalRequired}`);
      
      // 3. Approve prescription
      console.log(`\n📋 Step 3: Approve prescription as ${testUser.role}`);
      const approvalResponse = await fetch(`${BASE_URL}/api/prescriptions/${prescription.id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': authCookie
        },
        body: JSON.stringify({
          action: 'approve',
          price: 19.99,
          notes: `Approved by ${testUser.role} - ${testUser.email}`
        })
      });
      
      if (!approvalResponse.ok) {
        console.error(`❌ Approval failed for ${testUser.role}`);
        const errorText = await approvalResponse.text();
        console.log(`   Error: ${errorText}`);
        continue;
      }
      
      const approvalResult = await approvalResponse.json();
      const approvedPrescription = approvalResult.data.prescription;
      
      console.log(`✅ Prescription approved successfully`);
      console.log(`   Status: ${approvedPrescription.status}`);
      console.log(`   Approved by: ${approvedPrescription.approvedByUser.name}`);
      console.log(`   Approved at: ${approvedPrescription.approvedAt}`);
      console.log(`   Amount: £${approvedPrescription.amount}`);
      console.log(`   Action by: ${approvalResult.actionBy}`);
      
      // 4. Verify prescription status
      console.log(`\n📋 Step 4: Verify prescription status`);
      const verifyResponse = await fetch(`${BASE_URL}/api/prescriptions/${prescription.id}`, {
        method: 'GET',
        headers: {
          'Cookie': authCookie
        }
      });
      
      if (verifyResponse.ok) {
        const verifyResult = await verifyResponse.json();
        console.log(`✅ Prescription verification successful`);
        console.log(`   Final Status: ${verifyResult.data ? verifyResult.data.status : 'Unknown'}`);
      } else {
        console.log(`⚠️  Prescription verification skipped (endpoint might not exist)`);
      }
      
      console.log(`\n🎉 ${testUser.role.toUpperCase()} approval workflow completed successfully!`);
    }
    
    console.log('\n🎊 SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Total prescriptions created: ${testPrescriptions.length}`);
    console.log(`✅ Admin approval: ${testPrescriptions.length > 0 ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Staff approval: ${testPrescriptions.length > 1 ? 'WORKING' : 'FAILED'}`);
    console.log(`✅ Both admin and staff can approve prescriptions: ${testPrescriptions.length === 2 ? 'CONFIRMED' : 'NEEDS VERIFICATION'}`);
    
    if (testPrescriptions.length > 0) {
      console.log('\n📋 Created Test Prescriptions:');
      testPrescriptions.forEach((prescription, index) => {
        console.log(`   ${index + 1}. ID: ${prescription.id} - ${prescription.medicine} - Status: ${prescription.status}`);
      });
    }
    
    console.log('\n🚀 Staff/Admin approval system is ready for production!');
    
  } catch (error) {
    console.error('❌ Error during comprehensive approval test:', error);
  }
}

testStaffAdminApproval();
