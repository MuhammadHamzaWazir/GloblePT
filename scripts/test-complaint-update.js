const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testComplaintUpdate() {
  try {
    console.log('🔍 Testing Complaint Update Functionality...\n');

    // Step 1: Login as admin
    console.log('1. Logging in as admin...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@pharmacy.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Admin login failed');
      return;
    }

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader.match(/pharmacy_auth=([^;]+)/);
    const adminToken = tokenMatch[1];
    console.log('✅ Admin login successful');

    // Step 2: Get existing complaints to update
    console.log('\n2. Fetching existing complaints...');
    const complaintsResponse = await fetch('http://localhost:3000/api/admin/complaints', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': `pharmacy_auth=${adminToken}`
      }
    });

    if (!complaintsResponse.ok) {
      console.log('❌ Failed to fetch complaints, status:', complaintsResponse.status);
      const errorText = await complaintsResponse.text();
      console.log('Error response:', errorText);
      return;
    }

    const complaintsData = await complaintsResponse.json();
    console.log('Complaints response data:', complaintsData);
    
    const complaints = complaintsData.data?.complaints || complaintsData.complaints;
    if (!complaintsData.success || !complaints || complaints.length === 0) {
      console.log('❌ No complaints found to update');
      return;
    }

    const targetComplaint = complaints[0];
    console.log(`✅ Found complaint to update: ID ${targetComplaint.id} - "${targetComplaint.title}"`);
    console.log(`   Current status: ${targetComplaint.status}`);
    console.log(`   Current priority: ${targetComplaint.priority}`);

    // Step 3: Get staff to assign
    console.log('\n3. Fetching staff members...');
    const staffResponse = await fetch('http://localhost:3000/api/admin/staff', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Cookie': `pharmacy_auth=${adminToken}`
      }
    });

    let staffMember = null;
    if (staffResponse.ok) {
      const staffData = await staffResponse.json();
      console.log('Staff response data:', staffData);
      const staffList = staffData.data?.staff || staffData.staff;
      if (staffData.success && staffList && staffList.length > 0) {
        staffMember = staffList[0];
        console.log(`✅ Found staff member: ${staffMember.name} (ID: ${staffMember.id})`);
      } else {
        console.log('No staff members found');
      }
    } else {
      console.log('Failed to fetch staff members, status:', staffResponse.status);
      const errorText = await staffResponse.text();
      console.log('Staff error response:', errorText);
    }

    // Step 4: Update complaint
    console.log('\n4. Updating complaint...');
    const updateData = {
      status: 'investigating',
      priority: 'high',
      assignedToId: staffMember ? staffMember.id : null
    };

    console.log('Update data:', updateData);

    const updateResponse = await fetch(`http://localhost:3000/api/admin/complaints/${targetComplaint.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${adminToken}`
      },
      credentials: 'include',
      body: JSON.stringify(updateData)
    });

    console.log('Update response status:', updateResponse.status);
    const updateResult = await updateResponse.json();
    console.log('Update response:', updateResult);

    if (updateResponse.ok && updateResult.success) {
      console.log('✅ Complaint updated successfully!');
      console.log(`   New status: ${updateResult.complaint.status}`);
      console.log(`   New priority: ${updateResult.complaint.priority}`);
      if (updateResult.complaint.assignedTo) {
        console.log(`   Assigned to: ${updateResult.complaint.assignedTo.name}`);
      }
    } else {
      console.log('❌ Complaint update failed:', updateResult.message);
    }

    // Step 5: Resolve the complaint
    console.log('\n5. Resolving complaint...');
    const resolveData = {
      status: 'resolved',
      resolution: 'Issue resolved through testing process'
    };

    const resolveResponse = await fetch(`http://localhost:3000/api/admin/complaints/${targetComplaint.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${adminToken}`
      },
      credentials: 'include',
      body: JSON.stringify(resolveData)
    });

    const resolveResult = await resolveResponse.json();
    console.log('Resolve response:', resolveResult);

    if (resolveResponse.ok && resolveResult.success) {
      console.log('✅ Complaint resolved successfully!');
      console.log(`   Final status: ${resolveResult.complaint.status}`);
      console.log(`   Resolution: ${resolveResult.complaint.resolution}`);
      console.log(`   Resolved at: ${resolveResult.complaint.resolvedAt}`);
    } else {
      console.log('❌ Complaint resolution failed:', resolveResult.message);
    }

  } catch (error) {
    console.error('❌ Network error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testComplaintUpdate();
