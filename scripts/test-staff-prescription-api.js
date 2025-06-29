const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testStaffPrescriptionAPI() {
  try {
    console.log('👔 Testing staff prescription management API...\n');

    // Step 1: Login as staff member
    console.log('Step 1: Logging in as staff member...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'staff@test.com',
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
    console.log('✅ Logged in successfully as staff member\n');

    // Step 2: Test GET staff prescriptions
    console.log('Step 2: Testing GET staff prescriptions...');
    const getPrescriptionsResponse = await fetch('http://localhost:3000/api/staff/prescriptions?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Cookie': `pharmacy_auth=${jwtToken}`
      }
    });

    const getPrescriptionsResult = await getPrescriptionsResponse.json();
    console.log('GET staff prescriptions status:', getPrescriptionsResponse.status);
    
    if (getPrescriptionsResponse.ok && getPrescriptionsResult.success) {
      console.log('✅ GET staff prescriptions successful');
      console.log(`Found ${getPrescriptionsResult.data.prescriptions.length} assigned prescriptions`);
      console.log(`Total: ${getPrescriptionsResult.data.pagination.totalPrescriptions}`);
      
      // Show assigned prescriptions
      if (getPrescriptionsResult.data.prescriptions.length > 0) {
        console.log('\n📋 Assigned prescriptions:');
        getPrescriptionsResult.data.prescriptions.forEach(p => {
          console.log(`  - ID: ${p.id}, Medicine: ${p.medicine}, Customer: ${p.user.name}, Status: ${p.status}`);
        });

        // Step 3: Test updating a prescription status
        const prescriptionToUpdate = getPrescriptionsResult.data.prescriptions.find(p => 
          ['approved', 'paid', 'ready_to_ship'].includes(p.status)
        );

        if (prescriptionToUpdate) {
          console.log(`\nStep 3: Testing prescription status update (ID: ${prescriptionToUpdate.id})...`);
          
          let newStatus = 'ready_to_ship';
          if (prescriptionToUpdate.status === 'ready_to_ship') {
            newStatus = 'dispatched';
          } else if (prescriptionToUpdate.status === 'dispatched') {
            newStatus = 'delivered';
          }

          const updateData = { status: newStatus };
          if (newStatus === 'dispatched') {
            updateData.trackingNumber = 'STAFF123456789';
          }

          const updateResponse = await fetch(`http://localhost:3000/api/staff/prescriptions/${prescriptionToUpdate.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `pharmacy_auth=${jwtToken}`
            },
            body: JSON.stringify(updateData)
          });

          const updateResult = await updateResponse.json();
          console.log('Update status:', updateResponse.status);
          
          if (updateResponse.ok && updateResult.success) {
            console.log('✅ Prescription status updated successfully');
            console.log(`  Updated to: ${updateResult.data.prescription.status}`);
          } else {
            console.log('❌ Update failed:', updateResult);
          }
        } else {
          console.log('\nStep 3: No updateable prescriptions found');
        }
      }
    } else {
      console.log('❌ GET staff prescriptions failed:', getPrescriptionsResult);
    }

    // Show final summary
    console.log('\n📊 Final Status Summary for this staff member:');
    const staffRecord = await prisma.staff.findUnique({
      where: { email: 'staff@test.com' }
    });

    if (staffRecord) {
      const assignedPrescriptions = await prisma.prescription.findMany({
        where: { staffId: staffRecord.id },
        include: { user: true }
      });

      console.log(`Staff member: ${staffRecord.name}`);
      console.log(`Total assigned prescriptions: ${assignedPrescriptions.length}`);
      
      if (assignedPrescriptions.length > 0) {
        const statusCounts = {};
        assignedPrescriptions.forEach(p => {
          statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
        });

        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`  ${status}: ${count} prescriptions`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testStaffPrescriptionAPI();
