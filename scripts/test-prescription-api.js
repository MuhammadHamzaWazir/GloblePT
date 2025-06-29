const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrescriptionAPI() {
  try {
    console.log('🧪 Testing prescription management system...\n');

    // Step 1: Login as admin
    console.log('Step 1: Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'password123'
      })
    });

    const loginResult = await loginResponse.json();
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResult.message}`);
    }

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader.match(/pharmacy_auth=([^;]+)/);
    const jwtToken = tokenMatch[1];
    console.log('✅ Logged in successfully\n');

    // Step 2: Test GET prescriptions
    console.log('Step 2: Testing GET admin prescriptions...');
    const getPrescriptionsResponse = await fetch('http://localhost:3000/api/admin/prescriptions?page=1&limit=5', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${jwtToken}`
      }
    });

    const getPrescriptionsResult = await getPrescriptionsResponse.json();
    console.log('GET prescriptions status:', getPrescriptionsResponse.status);
    
    if (getPrescriptionsResponse.ok && getPrescriptionsResult.success) {
      console.log('✅ GET prescriptions successful');
      console.log(`Found ${getPrescriptionsResult.data.prescriptions.length} prescriptions`);
      console.log(`Total prescriptions: ${getPrescriptionsResult.data.pagination.totalPrescriptions}`);
      
      // Show first prescription
      if (getPrescriptionsResult.data.prescriptions.length > 0) {
        const firstPrescription = getPrescriptionsResult.data.prescriptions[0];
        console.log('\n📋 Sample prescription:');
        console.log(`  Customer: ${firstPrescription.user.name} (${firstPrescription.user.email})`);
        console.log(`  Medicine: ${firstPrescription.medicine}`);
        console.log(`  Amount: £${firstPrescription.amount}`);
        console.log(`  Status: ${firstPrescription.status}`);
        console.log(`  Payment: ${firstPrescription.paymentStatus}`);
      }
    } else {
      console.log('❌ GET prescriptions failed:', getPrescriptionsResult);
    }

    // Step 3: Test updating a prescription status (approve the first pending one)
    const pendingPrescriptions = getPrescriptionsResult.data?.prescriptions?.filter(p => p.status === 'pending');
    
    if (pendingPrescriptions && pendingPrescriptions.length > 0) {
      console.log(`\nStep 3: Testing prescription approval (ID: ${pendingPrescriptions[0].id})...`);
      
      const updateResponse = await fetch(`http://localhost:3000/api/admin/prescriptions/${pendingPrescriptions[0].id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `pharmacy_auth=${jwtToken}`
        },
        body: JSON.stringify({
          status: 'approved'
        })
      });

      const updateResult = await updateResponse.json();
      console.log('Update status:', updateResponse.status);
      
      if (updateResponse.ok && updateResult.success) {
        console.log('✅ Prescription approved successfully');
        console.log(`  Updated prescription: ${updateResult.data.prescription.medicine}`);
        console.log(`  New status: ${updateResult.data.prescription.status}`);
      } else {
        console.log('❌ Approval failed:', updateResult);
      }
    } else {
      console.log('\nStep 3: No pending prescriptions to approve');
    }

    // Step 4: Test creating payment for approved prescription
    const approvedPrescriptions = await prisma.prescription.findMany({
      where: { 
        status: 'approved',
        paymentStatus: 'unpaid'
      },
      take: 1
    });

    if (approvedPrescriptions.length > 0) {
      console.log(`\nStep 4: Testing payment creation (ID: ${approvedPrescriptions[0].id})...`);
      
      const paymentResponse = await fetch(`http://localhost:3000/api/admin/prescriptions/${approvedPrescriptions[0].id}/create-payment`, {
        method: 'POST',
        headers: {
          'Cookie': `pharmacy_auth=${jwtToken}`
        }
      });

      const paymentResult = await paymentResponse.json();
      console.log('Payment creation status:', paymentResponse.status);
      
      if (paymentResponse.ok && paymentResult.success) {
        console.log('✅ Payment intent created successfully');
        console.log(`  Payment amount: £${paymentResult.paymentIntent.amount / 100}`);
        console.log(`  Payment ID: ${paymentResult.paymentIntent.id}`);
      } else {
        console.log('❌ Payment creation failed:', paymentResult);
      }
    } else {
      console.log('\nStep 4: No approved prescriptions available for payment');
    }

    // Show final status summary
    console.log('\n📊 Final Prescription Status Summary:');
    const statusCounts = await prisma.prescription.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    statusCounts.forEach(item => {
      console.log(`   ${item.status}: ${item._count.status} prescriptions`);
    });

    console.log('\n🎉 Prescription management system test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrescriptionAPI();
