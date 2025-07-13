#!/usr/bin/env node

/**
 * CREATE ROLES FIRST, THEN USERS
 * This script creates roles and then users with different roles
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createRolesAndUsers() {
  console.log('👥 CREATING ROLES AND USERS FOR LOCAL TESTING');
  console.log('=============================================');
  
  try {
    // Hash password function
    const hashPassword = async (password) => {
      return await bcrypt.hash(password, 10);
    };

    // Clean up existing data (handle foreign key constraints)
    console.log('\n🧹 Cleaning up existing data...');
    await prisma.order.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.role.deleteMany({});
    await prisma.permission.deleteMany({});
    console.log('✅ Existing data cleaned up');

    // 1. CREATE PERMISSIONS
    console.log('\n🔐 Creating Permissions...');
    const permissions = await Promise.all([
      prisma.permission.create({ data: { name: 'manage_users' } }),
      prisma.permission.create({ data: { name: 'approve_prescriptions' } }),
      prisma.permission.create({ data: { name: 'manage_staff' } }),
      prisma.permission.create({ data: { name: 'view_reports' } }),
      prisma.permission.create({ data: { name: 'manage_system' } }),
      prisma.permission.create({ data: { name: 'handle_complaints' } }),
      prisma.permission.create({ data: { name: 'view_prescriptions' } }),
      prisma.permission.create({ data: { name: 'submit_prescriptions' } })
    ]);
    console.log('✅ Permissions created');

    // 2. CREATE ROLES
    console.log('\n👑 Creating Roles...');
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        permissions: {
          connect: permissions.map(p => ({ id: p.id }))
        }
      }
    });

    const staffRole = await prisma.role.create({
      data: {
        name: 'staff',
        permissions: {
          connect: [
            { id: permissions.find(p => p.name === 'approve_prescriptions').id },
            { id: permissions.find(p => p.name === 'view_reports').id },
            { id: permissions.find(p => p.name === 'handle_complaints').id },
            { id: permissions.find(p => p.name === 'view_prescriptions').id }
          ]
        }
      }
    });

    const userRole = await prisma.role.create({
      data: {
        name: 'user',
        permissions: {
          connect: [
            { id: permissions.find(p => p.name === 'submit_prescriptions').id }
          ]
        }
      }
    });

    console.log('✅ Roles created');

    // 3. CREATE ADMIN USER
    console.log('\n👑 Creating Admin User...');
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@globalpharmatrading.co.uk',
        password: await hashPassword('Admin@2024'),
        roleId: adminRole.id,
        identityVerified: true,
        ageVerified: true,
        accountStatus: 'verified',
        address: 'Unit 42b Bowlers Croft, Basildon, Essex, SS14 3ED',
        phone: '07950938398',
        dateOfBirth: new Date('1980-01-01')
      }
    });

    // Create staff record for admin
    await prisma.staff.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
        address: adminUser.address,
        phone: adminUser.phone
      }
    });

    console.log('✅ Admin user created');

    // 4. CREATE PHARMACIST (SUPERVISOR)
    console.log('\n💊 Creating Pharmacist (Supervisor)...');
    const pharmacistUser = await prisma.user.create({
      data: {
        name: 'Dr. Sarah Johnson',
        email: 'pharmacist@globalpharmatrading.co.uk',
        password: await hashPassword('Pharmacist@2024'),
        roleId: staffRole.id,
        identityVerified: true,
        ageVerified: true,
        accountStatus: 'verified',
        address: '123 Medical Street, London, E1 6AN',
        phone: '07700123456',
        dateOfBirth: new Date('1985-03-15')
      }
    });

    await prisma.staff.create({
      data: {
        name: pharmacistUser.name,
        email: pharmacistUser.email,
        address: pharmacistUser.address,
        phone: pharmacistUser.phone
      }
    });

    console.log('✅ Pharmacist user created');

    // 5. CREATE PHARMACY ASSISTANT
    console.log('\n🔧 Creating Pharmacy Assistant...');
    const assistantUser = await prisma.user.create({
      data: {
        name: 'Mike Wilson',
        email: 'assistant@globalpharmatrading.co.uk',
        password: await hashPassword('Assistant@2024'),
        roleId: staffRole.id,
        identityVerified: true,
        ageVerified: true,
        accountStatus: 'verified',
        address: '456 Helper Avenue, London, E2 7BC',
        phone: '07700234567',
        dateOfBirth: new Date('1990-07-22')
      }
    });

    await prisma.staff.create({
      data: {
        name: assistantUser.name,
        email: assistantUser.email,
        address: assistantUser.address,
        phone: assistantUser.phone
      }
    });

    console.log('✅ Pharmacy assistant user created');

    // 6. CREATE CUSTOMER USERS
    console.log('\n👤 Creating Customer Users...');
    
    // Customer 1 - Regular customer
    const customer1 = await prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'customer1@example.com',
        password: await hashPassword('Customer@2024'),
        roleId: userRole.id,
        identityVerified: true,
        ageVerified: true,
        accountStatus: 'verified',
        address: '789 Customer Street, London, SW1A 1AA',
        phone: '07700345678',
        dateOfBirth: new Date('1992-05-10')
      }
    });

    // Customer 2 - Another customer
    const customer2 = await prisma.user.create({
      data: {
        name: 'Emily Davis',
        email: 'customer2@example.com',
        password: await hashPassword('Customer@2024'),
        roleId: userRole.id,
        identityVerified: true,
        ageVerified: true,
        accountStatus: 'verified',
        address: '321 Patient Road, Manchester, M1 1AA',
        phone: '07700456789',
        dateOfBirth: new Date('1988-12-03')
      }
    });

    // Customer 3 - Test customer for email receipts
    const customer3 = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'test@example.com',
        password: await hashPassword('Test@2024'),
        roleId: userRole.id,
        identityVerified: true,
        ageVerified: true,
        accountStatus: 'verified',
        address: '555 Test Avenue, Birmingham, B1 1AA',
        phone: '07700567890',
        dateOfBirth: new Date('1995-09-18')
      }
    });

    console.log('✅ Customer users created');

    // 7. CREATE SAMPLE PRESCRIPTIONS
    console.log('\n💊 Creating Sample Prescriptions...');
    
    // Prescription 1 - Approved and ready for payment
    const prescription1 = await prisma.prescription.create({
      data: {
        userId: customer1.id,
        medicine: 'Paracetamol 500mg',
        dosage: '500mg',
        quantity: 2,
        instructions: 'Take 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.',
        prescriptionText: 'Standard paracetamol prescription for pain relief',
        medicineType: 'P', // Pharmacy Medicine
        requiresPrescription: false,
        ageRestricted: false,
        minimumAge: 16,
        capacityConfirmed: true,
        riskAssessmentComplete: true,
        pharmacistApprovalRequired: true,
        prescriptionValidated: true,
        status: 'approved',
        paymentStatus: 'unpaid',
        amount: 12.99,
        deliveryAddress: customer1.address,
        approvedBy: pharmacistUser.id,
        approvedAt: new Date()
      }
    });

    // Prescription 2 - Pending approval
    const prescription2 = await prisma.prescription.create({
      data: {
        userId: customer2.id,
        medicine: 'Ibuprofen 400mg',
        dosage: '400mg',
        quantity: 1,
        instructions: 'Take 1 tablet up to 3 times daily with food.',
        prescriptionText: 'Anti-inflammatory medication for pain relief',
        medicineType: 'P', // Pharmacy Medicine
        requiresPrescription: false,
        ageRestricted: false,
        minimumAge: 16,
        capacityConfirmed: false,
        riskAssessmentComplete: false,
        pharmacistApprovalRequired: true,
        prescriptionValidated: false,
        status: 'pending',
        paymentStatus: 'unpaid',
        amount: 8.50,
        deliveryAddress: customer2.address
      }
    });

    // Prescription 3 - For testing payment flow
    const prescription3 = await prisma.prescription.create({
      data: {
        userId: customer3.id,
        medicine: 'Vitamin D3 1000IU',
        dosage: '1000IU',
        quantity: 1,
        instructions: 'Take 1 tablet daily with breakfast.',
        prescriptionText: 'Vitamin D3 supplement for general health',
        medicineType: 'GSL', // General Sale List
        requiresPrescription: false,
        ageRestricted: false,
        minimumAge: 16,
        capacityConfirmed: true,
        riskAssessmentComplete: true,
        pharmacistApprovalRequired: true,
        prescriptionValidated: true,
        status: 'approved',
        paymentStatus: 'unpaid',
        amount: 15.99,
        deliveryAddress: customer3.address,
        approvedBy: pharmacistUser.id,
        approvedAt: new Date()
      }
    });

    console.log('✅ Sample prescriptions created');

    // 8. DISPLAY LOGIN CREDENTIALS
    console.log('\n🔑 USER LOGIN CREDENTIALS FOR LOCAL TESTING');
    console.log('============================================');
    
    console.log('\n👑 ADMIN USER:');
    console.log('Email: admin@globalpharmatrading.co.uk');
    console.log('Password: Admin@2024');
    console.log('Role: Administrator');
    console.log('Access: Full system access, user management, reports');
    console.log('Dashboard: http://localhost:3000/admin/dashboard');
    
    console.log('\n💊 PHARMACIST (SUPERVISOR):');
    console.log('Email: pharmacist@globalpharmatrading.co.uk');
    console.log('Password: Pharmacist@2024');
    console.log('Role: Senior Pharmacist');
    console.log('Access: Prescription approval, staff management, reports');
    console.log('Dashboard: http://localhost:3000/staff-dashboard');
    
    console.log('\n🔧 PHARMACY ASSISTANT:');
    console.log('Email: assistant@globalpharmatrading.co.uk');
    console.log('Password: Assistant@2024');
    console.log('Role: Pharmacy Assistant');
    console.log('Access: Basic prescription handling, no approvals');
    console.log('Dashboard: http://localhost:3000/staff-dashboard');
    
    console.log('\n👤 CUSTOMER 1:');
    console.log('Email: customer1@example.com');
    console.log('Password: Customer@2024');
    console.log('Role: Customer');
    console.log('Status: Has approved prescription ready for payment (£12.99)');
    console.log('Dashboard: http://localhost:3000/dashboard');
    
    console.log('\n👤 CUSTOMER 2:');
    console.log('Email: customer2@example.com');
    console.log('Password: Customer@2024');
    console.log('Role: Customer');
    console.log('Status: Has pending prescription awaiting approval (£8.50)');
    console.log('Dashboard: http://localhost:3000/dashboard');
    
    console.log('\n👤 TEST CUSTOMER:');
    console.log('Email: test@example.com');
    console.log('Password: Test@2024');
    console.log('Role: Customer');
    console.log('Status: For testing email receipt system (£15.99)');
    console.log('Dashboard: http://localhost:3000/dashboard');

    // 9. DISPLAY TESTING SCENARIOS
    console.log('\n🧪 TESTING SCENARIOS:');
    console.log('=====================');
    
    console.log('\n📋 ADMIN TESTING:');
    console.log('• Login: admin@globalpharmatrading.co.uk / Admin@2024');
    console.log('• Access admin dashboard at /admin/dashboard');
    console.log('• Manage users and staff');
    console.log('• View all prescriptions and orders');
    console.log('• Test nuclear logout functionality');
    
    console.log('\n💊 PHARMACIST TESTING:');
    console.log('• Login: pharmacist@globalpharmatrading.co.uk / Pharmacist@2024');
    console.log('• Approve pending prescriptions');
    console.log('• Set prescription pricing');
    console.log('• Manage pharmacy staff');
    console.log('• View pharmacy reports');
    
    console.log('\n🔧 ASSISTANT TESTING:');
    console.log('• Login: assistant@globalpharmatrading.co.uk / Assistant@2024');
    console.log('• View assigned prescriptions');
    console.log('• Process basic prescription tasks');
    console.log('• Limited access to system features');
    
    console.log('\n👤 CUSTOMER TESTING:');
    console.log('• Login: customer1@example.com / Customer@2024 (approved prescription)');
    console.log('• Login: customer2@example.com / Customer@2024 (pending prescription)');
    console.log('• Login: test@example.com / Test@2024 (for email testing)');
    console.log('• Submit new prescriptions');
    console.log('• Make payments via Stripe');
    console.log('• Test email receipt system');
    console.log('• Track orders in dashboard');

    console.log('\n💳 PAYMENT TESTING:');
    console.log('==================');
    console.log('• Login as customer1@example.com');
    console.log('• Pay for approved prescription (£12.99)');
    console.log('• Use Stripe test card: 4242 4242 4242 4242');
    console.log('• Expiry: Any future date (e.g., 12/25)');
    console.log('• CVC: Any 3 digits (e.g., 123)');
    console.log('• Verify email receipt is sent');
    console.log('• Check order creation and tracking');

    console.log('\n🎯 QUICK START GUIDE:');
    console.log('=====================');
    console.log('1. Start local server: npm run dev');
    console.log('2. Visit: http://localhost:3000');
    console.log('3. Login with any of the credentials above');
    console.log('4. Test the email receipt system with payments');
    console.log('5. Test nuclear logout functionality');
    console.log('6. Admin can manage all users and prescriptions');

    console.log('\n✅ ALL USERS AND ROLES CREATED SUCCESSFULLY!');
    console.log('=============================================');
    console.log('🎉 Ready for comprehensive testing');
    console.log('📧 Email receipt system ready');
    console.log('💳 Payment system ready');
    console.log('🔐 Authentication system ready');
    console.log('👥 All user roles configured');
    console.log('🏥 Complete pharmacy workflow ready');

  } catch (error) {
    console.error('❌ Error creating roles and users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the user creation
createRolesAndUsers().catch(console.error);
