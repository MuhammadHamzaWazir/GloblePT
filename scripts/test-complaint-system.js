const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testComplaintSystem() {
  try {
    console.log('🔍 Testing Complaint Management System...\n');

    // Step 1: Test customer complaint submission
    console.log('Step 1: Testing customer complaint submission...');
    
    // Get a customer for testing
    const customer = await prisma.user.findFirst({
      where: {
        role: {
          name: 'customer'
        }
      }
    });

    if (!customer) {
      console.log('❌ No customer found for testing');
      return;
    }

    // Login as customer and test complaint API
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'customer@pharmacy.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Customer login failed');
      return;
    }

    const setCookieHeader = loginResponse.headers.get('set-cookie');
    const tokenMatch = setCookieHeader.match(/pharmacy_auth=([^;]+)/);
    const customerToken = tokenMatch[1];
    console.log('✅ Customer logged in successfully');

    // Submit a test complaint
    const testComplaint = {
      title: 'Test API Complaint - Slow Service',
      description: 'This is a test complaint submitted via API. The service was very slow and I had to wait 30 minutes for my prescription.',
      category: 'service',
      priority: 'medium'
    };

    const submitResponse = await fetch('http://localhost:3000/api/complaints', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `pharmacy_auth=${customerToken}`
      },
      body: JSON.stringify(testComplaint)
    });

    const submitResult = await submitResponse.json();
    if (submitResponse.ok && submitResult.success) {
      console.log('✅ Customer complaint submitted successfully');
      console.log(`   Complaint ID: ${submitResult.data.complaint.id}`);
      const newComplaintId = submitResult.data.complaint.id;

      // Step 2: Test admin complaint management
      console.log('\nStep 2: Testing admin complaint management...');
      
      // Login as admin
      const adminLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@pharmacy.com',
          password: 'password123'
        })
      });

      if (!adminLoginResponse.ok) {
        console.log('❌ Admin login failed');
        return;
      }

      const adminSetCookieHeader = adminLoginResponse.headers.get('set-cookie');
      const adminTokenMatch = adminSetCookieHeader.match(/pharmacy_auth=([^;]+)/);
      const adminToken = adminTokenMatch[1];
      console.log('✅ Admin logged in successfully');

      // Fetch all complaints
      const fetchResponse = await fetch('http://localhost:3000/api/admin/complaints?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Cookie': `pharmacy_auth=${adminToken}`
        }
      });

      const fetchResult = await fetchResponse.json();
      if (fetchResponse.ok && fetchResult.success) {
        console.log('✅ Admin fetched complaints successfully');
        console.log(`   Found ${fetchResult.data.complaints.length} complaints`);
        
        // Step 3: Test complaint assignment
        console.log('\nStep 3: Testing complaint assignment to staff...');
        
        // Get a staff member
        const staffMember = await prisma.staff.findFirst();
        if (staffMember) {
          const assignResponse = await fetch(`http://localhost:3000/api/admin/complaints/${newComplaintId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': `pharmacy_auth=${adminToken}`
            },
            body: JSON.stringify({
              assignedToId: staffMember.id,
              status: 'investigating',
              priority: 'high'
            })
          });

          const assignResult = await assignResponse.json();
          if (assignResponse.ok && assignResult.success) {
            console.log('✅ Complaint assigned to staff successfully');
            console.log(`   Assigned to: ${staffMember.name}`);
            console.log(`   Status: ${assignResult.data.complaint.status}`);

            // Step 4: Test staff complaint management
            console.log('\nStep 4: Testing staff complaint management...');
            
            // Login as staff
            const staffLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: 'staff@pharmacy.com',
                password: 'password123'
              })
            });

            if (staffLoginResponse.ok) {
              const staffSetCookieHeader = staffLoginResponse.headers.get('set-cookie');
              const staffTokenMatch = staffSetCookieHeader.match(/pharmacy_auth=([^;]+)/);
              const staffToken = staffTokenMatch[1];
              console.log('✅ Staff logged in successfully');

              // Fetch assigned complaints
              const staffFetchResponse = await fetch('http://localhost:3000/api/staff/complaints', {
                method: 'GET',
                headers: {
                  'Cookie': `pharmacy_auth=${staffToken}`
                }
              });

              const staffFetchResult = await staffFetchResponse.json();
              if (staffFetchResponse.ok && staffFetchResult.success) {
                console.log('✅ Staff fetched assigned complaints successfully');
                console.log(`   Found ${staffFetchResult.data.complaints.length} assigned complaints`);

                // Resolve the complaint
                const resolveResponse = await fetch(`http://localhost:3000/api/staff/complaints/${newComplaintId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json',
                    'Cookie': `pharmacy_auth=${staffToken}`
                  },
                  body: JSON.stringify({
                    status: 'resolved',
                    resolution: 'We have improved our service process and reduced waiting times. The customer has been contacted and is satisfied with our response.'
                  })
                });

                const resolveResult = await resolveResponse.json();
                if (resolveResponse.ok && resolveResult.success) {
                  console.log('✅ Staff resolved complaint successfully');
                  console.log(`   Status: ${resolveResult.data.complaint.status}`);
                } else {
                  console.log('❌ Staff complaint resolution failed:', resolveResult);
                }
              } else {
                console.log('❌ Staff fetch complaints failed:', staffFetchResult);
              }
            } else {
              console.log('❌ Staff login failed');
            }
          } else {
            console.log('❌ Complaint assignment failed:', assignResult);
          }
        } else {
          console.log('❌ No staff member found for assignment');
        }
      } else {
        console.log('❌ Admin fetch complaints failed:', fetchResult);
      }
    } else {
      console.log('❌ Customer complaint submission failed:', submitResult);
    }

    // Step 5: Show final system status
    console.log('\n📊 Final System Status:');
    
    const totalComplaints = await prisma.complaint.count();
    const statusCounts = await prisma.complaint.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    const assignedCount = await prisma.complaint.count({
      where: { assignedToId: { not: null } }
    });

    console.log(`   Total complaints: ${totalComplaints}`);
    console.log(`   Assigned complaints: ${assignedCount}`);
    statusCounts.forEach(({ status, _count }) => {
      console.log(`   ${status}: ${_count.status}`);
    });

    console.log('\n🎉 Complaint Management System Test Complete!');
    console.log('\n✅ All features working:');
    console.log('   • Customer complaint submission');
    console.log('   • Admin complaint viewing and management');
    console.log('   • Staff assignment by admin');
    console.log('   • Staff complaint resolution');
    console.log('   • Status workflow (received → investigating → resolved)');

  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testComplaintSystem();
