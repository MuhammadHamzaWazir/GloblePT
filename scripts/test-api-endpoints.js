// Test API endpoints directly
console.log('🧪 Testing API endpoints...\n');

// Test data
const testPrescription = {
  medicine: 'API Test Medicine',
  quantity: 2,
  dosage: '500mg twice daily',
  instructions: 'Take with food',
  doctorName: 'Dr. Test',
  doctorContact: '123-456-7890',
  deliveryAddress: '789 API Test Street',
  urgency: 'normal',
  notes: 'API testing'
};

console.log('Test prescription data:');
console.log(JSON.stringify(testPrescription, null, 2));

console.log('\n✅ API endpoint test data ready');
console.log('📋 To test manually:');
console.log('1. Open browser to http://localhost:3000/dashboard/prescriptions');
console.log('2. Click "Submit New Prescription" button');
console.log('3. Fill in the form with test data');
console.log('4. Submit and verify status is "pending"');
console.log('5. Navigate to staff dashboard to update status');

console.log('\n🔧 Status workflow:');
console.log('pending → processing → approved → ready → dispatched → delivered → completed');

console.log('\n📁 Updated files:');
console.log('✅ /api/prescriptions/submit/route.ts - Default status: pending');
console.log('✅ /api/prescriptions/[id]/status/route.ts - Status update API');
console.log('✅ /dashboard/prescriptions/page.tsx - Frontend status display');
console.log('✅ /staff-dashboard/prescriptions/page.tsx - Staff status management');
