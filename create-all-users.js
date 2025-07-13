#!/usr/bin/env node

/**
 * CREATE ALL USERS FOR LOCAL TESTING
 * This script creates comprehensive test users with different roles
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAllUsers() {
  console.log('👥 CREATING ALL USERS FOR LOCAL TESTING');
  console.log('======================================');
  
  try {
    // Hash password function
    const hashPassword = async (password) => {
      return await bcrypt.hash(password, 10);
    };

    // Clean up existing data (handle foreign key constraints)
    console.log('\n🧹 Cleaning up existing data...');
    // Delete in proper order to handle foreign key constraints
    await prisma.order.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.staff.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Existing data cleaned up');

    // 1. CREATE ADMIN USER
    console.log('\n👑 Creating Admin User...');
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@globalpharmatrading.co.uk',
        password: await hashPassword('Admin@2024'),
        role: 'admin',
        isVerified: true,
        address: 'Unit 42b Bowlers Croft, Basildon, Essex, SS14 3ED',
        phone: '07950938398',
        dateOfBirth: new Date('1980-01-01'),
        emergencyContact: 'Emergency Admin Contact',
        emergencyPhone: '07950938399'
      }
    });

    // Create staff record for admin
    await prisma.staff.create({
      data: {
        userId: adminUser.id,
        position: 'Administrator',
        department: 'Administration',
        qualifications: 'MBA, Pharmacy Management',
        licenseNumber: 'ADMIN001',
        isActive: true,
        canApprovePrescriptions: true,
        canManageStaff: true,
        canViewReports: true,
        canManageSystem: true
      }
    });

    console.log('✅ Admin user created');

    // 2. CREATE PHARMACIST (SUPERVISOR)
    console.log('\n💊 Creating Pharmacist (Supervisor)...');
    const pharmacistUser = await prisma.user.create({
      data: {
        name: 'Dr. Sarah Johnson',
        email: 'pharmacist@globalpharmatrading.co.uk',
        password: await hashPassword('Pharmacist@2024'),
        role: 'staff',
        isVerified: true,
        address: '123 Medical Street, London, E1 6AN',
        phone: '07700123456',
        dateOfBirth: new Date('1985-03-15'),
        emergencyContact: 'John Johnson',
        emergencyPhone: '07700123457'
      }
    });

    await prisma.staff.create({
      data: {
        userId: pharmacistUser.id,
        position: 'Senior Pharmacist',
        department: 'Pharmacy',
        qualifications: 'PharmD, MSc Clinical Pharmacy',
        licenseNumber: 'PHARM001',
        isActive: true,
        canApprovePrescriptions: true,
        canManageStaff: true,
        canViewReports: true,
        canManageSystem: false,
        supervisorId: adminUser.id
      }
    });

    console.log('✅ Pharmacist user created');

    // 3. CREATE PHARMACY ASSISTANT
    console.log('\n🔧 Creating Pharmacy Assistant...');
    const assistantUser = await prisma.user.create({
      data: {
        name: 'Mike Wilson',
        email: 'assistant@globalpharmatrading.co.uk',
        password: await hashPassword('Assistant@2024'),
        role: 'staff',
        isVerified: true,
        address: '456 Helper Avenue, London, E2 7BC',
        phone: '07700234567',
        dateOfBirth: new Date('1990-07-22'),
        emergencyContact: 'Emma Wilson',
        emergencyPhone: '07700234568'
      }
    });

    await prisma.staff.create({
      data: {
        userId: assistantUser.id,
        position: 'Pharmacy Assistant',
        department: 'Pharmacy',
        qualifications: 'Pharmacy Assistant Certificate',
        licenseNumber: 'ASSIST001',
        isActive: true,
        canApprovePrescriptions: false,
        canManageStaff: false,
        canViewReports: false,
        canManageSystem: false,
        supervisorId: pharmacistUser.id
      }
    });

    console.log('✅ Pharmacy assistant user created');

    // 4. CREATE CUSTOMER USERS
    console.log('\n👤 Creating Customer Users...');
    
    // Customer 1 - Regular customer
    const customer1 = await prisma.user.create({
      data: {
        name: 'John Smith',
        email: 'customer1@example.com',
        password: await hashPassword('Customer@2024'),
        role: 'user',
        isVerified: true,
        address: '789 Customer Street, London, SW1A 1AA',
        phone: '07700345678',
        dateOfBirth: new Date('1992-05-10'),
        emergencyContact: 'Jane Smith',
        emergencyPhone: '07700345679'
      }
    });

    // Customer 2 - Another customer
    const customer2 = await prisma.user.create({
      data: {
        name: 'Emily Davis',
        email: 'customer2@example.com',
        password: await hashPassword('Customer@2024'),
        role: 'user',
        isVerified: true,
        address: '321 Patient Road, Manchester, M1 1AA',
        phone: '07700456789',
        dateOfBirth: new Date('1988-12-03'),
        emergencyContact: 'Robert Davis',
        emergencyPhone: '07700456790'
      }
    });

    // Customer 3 - Test customer for email receipts
    const customer3 = await prisma.user.create({
      data: {
        name: 'Test Customer',
        email: 'test@example.com',
        password: await hashPassword('Test@2024'),
        role: 'user',
        isVerified: true,
        address: '555 Test Avenue, Birmingham, B1 1AA',
        phone: '07700567890',
        dateOfBirth: new Date('1995-09-18'),
        emergencyContact: 'Test Emergency',
        emergencyPhone: '07700567891'
      }
    });

    console.log('✅ Customer users created');

    // 5. CREATE SAMPLE PRESCRIPTIONS
    console.log('\n💊 Creating Sample Prescriptions...');
    
    // Prescription 1 - Approved and ready for payment
    const prescription1 = await prisma.prescription.create({
      data: {
        userId: customer1.id,
        medicine: 'Paracetamol 500mg',
        dosage: '500mg',
        quantity: 2,
        instructions: 'Take 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours.',
        prescriptionImage: '/uploads/sample-prescription-1.jpg',
        status: 'approved',
        paymentStatus: 'unpaid',
        amount: 12.99,
        deliveryAddress: customer1.address,
        notes: 'Standard paracetamol prescription'
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
        prescriptionImage: '/uploads/sample-prescription-2.jpg',
        status: 'pending',
        paymentStatus: 'unpaid',
        amount: 8.50,
        deliveryAddress: customer2.address,
        notes: 'Anti-inflammatory medication'
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
        prescriptionImage: '/uploads/sample-prescription-3.jpg',
        status: 'approved',
        paymentStatus: 'unpaid',
        amount: 15.99,
        deliveryAddress: customer3.address,
        notes: 'Vitamin supplement'
      }
    });

    console.log('✅ Sample prescriptions created');

    // 6. DISPLAY LOGIN CREDENTIALS
    console.log('\n🔑 USER LOGIN CREDENTIALS FOR LOCAL TESTING');
    console.log('============================================');
    
    console.log('\n👑 ADMIN USER:');
    console.log('Email: admin@globalpharmatrading.co.uk');
    console.log('Password: Admin@2024');
    console.log('Role: Administrator');
    console.log('Access: Full system access, user management, reports');
    
    console.log('\n💊 PHARMACIST (SUPERVISOR):');
    console.log('Email: pharmacist@globalpharmatrading.co.uk');
    console.log('Password: Pharmacist@2024');
    console.log('Role: Senior Pharmacist');
    console.log('Access: Prescription approval, staff management, reports');
    
    console.log('\n🔧 PHARMACY ASSISTANT:');
    console.log('Email: assistant@globalpharmatrading.co.uk');
    console.log('Password: Assistant@2024');
    console.log('Role: Pharmacy Assistant');
    console.log('Access: Basic prescription handling, no approvals');
    
    console.log('\n👤 CUSTOMER 1:');
    console.log('Email: customer1@example.com');
    console.log('Password: Customer@2024');
    console.log('Role: Customer');
    console.log('Status: Has approved prescription ready for payment');
    
    console.log('\n👤 CUSTOMER 2:');
    console.log('Email: customer2@example.com');
    console.log('Password: Customer@2024');
    console.log('Role: Customer');
    console.log('Status: Has pending prescription awaiting approval');
    
    console.log('\n👤 TEST CUSTOMER:');
    console.log('Email: test@example.com');
    console.log('Password: Test@2024');
    console.log('Role: Customer');
    console.log('Status: For testing email receipt system');

    // 7. DISPLAY TESTING SCENARIOS
    console.log('\n🧪 TESTING SCENARIOS:');
    console.log('=====================');
    
    console.log('\n📋 ADMIN TESTING:');
    console.log('• Login as admin@globalpharmatrading.co.uk');
    console.log('• Access admin dashboard');
    console.log('• Manage users and staff');
    console.log('• View all prescriptions and orders');
    console.log('• Test nuclear logout functionality');
    
    console.log('\n💊 PHARMACIST TESTING:');
    console.log('• Login as pharmacist@globalpharmatrading.co.uk');
    console.log('• Approve pending prescriptions');
    console.log('• Set prescription pricing');
    console.log('• Manage pharmacy staff');
    console.log('• View pharmacy reports');
    
    console.log('\n🔧 ASSISTANT TESTING:');
    console.log('• Login as assistant@globalpharmatrading.co.uk');
    console.log('• View assigned prescriptions');
    console.log('• Process basic prescription tasks');
    console.log('• Limited access to system features');
    
    console.log('\n👤 CUSTOMER TESTING:');
    console.log('• Login as customer1@example.com (has approved prescription)');
    console.log('• Login as customer2@example.com (has pending prescription)');
    console.log('• Login as test@example.com (for email testing)');
    console.log('• Submit new prescriptions');
    console.log('• Make payments via Stripe');
    console.log('• Test email receipt system');
    console.log('• Track orders in dashboard');

    console.log('\n💳 PAYMENT TESTING:');
    console.log('==================');
    console.log('• Login as customer1@example.com');
    console.log('• Pay for approved prescription (£12.99)');
    console.log('• Use Stripe test card: 4242 4242 4242 4242');
    console.log('• Verify email receipt is sent');
    console.log('• Check order creation and tracking');

    console.log('\n🎯 SYSTEM URLS:');
    console.log('===============');
    console.log('🌐 Production: https://globalpharmatrading.co.uk');
    console.log('🏠 Local: http://localhost:3000');
    console.log('🔧 Admin: /admin/dashboard');
    console.log('👥 Staff: /staff-dashboard');
    console.log('📊 User: /dashboard');

    console.log('\n✅ ALL USERS CREATED SUCCESSFULLY!');
    console.log('===================================');
    console.log('🎉 Ready for comprehensive testing');
    console.log('📧 Email receipt system ready');
    console.log('💳 Payment system ready');
    console.log('🔐 Authentication system ready');
    console.log('👥 All user roles configured');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the user creation
createAllUsers().catch(console.error);
