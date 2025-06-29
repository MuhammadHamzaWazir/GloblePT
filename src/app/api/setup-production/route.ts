import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple hash function for passwords (in production, use proper bcrypt)
async function hashPassword(password: string): Promise<string> {
  // For now, we'll use a simple hash. In production, install bcrypt properly
  return Buffer.from(password).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting production database setup...');

    // Check if this is a fresh database by looking for users
    const existingUsers = await prisma.user.count();
    
    if (existingUsers > 0) {
      return NextResponse.json({
        success: false,
        message: 'Database already contains data. Skipping setup to prevent duplicates.',
        userCount: existingUsers
      }, { status: 400 });
    }

    // Create roles first
    console.log('📝 Creating roles...');
    const roles = await Promise.all([
      prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: { name: 'admin' }
      }),
      prisma.role.upsert({
        where: { name: 'staff' },
        update: {},
        create: { name: 'staff' }
      }),
      prisma.role.upsert({
        where: { name: 'customer' },
        update: {},
        create: { name: 'customer' }
      })
    ]);

    console.log('✅ Roles created:', roles.map(r => r.name));

    // Create permissions
    console.log('🔐 Creating permissions...');
    const permissions = await Promise.all([
      prisma.permission.upsert({
        where: { name: 'manage_users' },
        update: {},
        create: { name: 'manage_users' }
      }),
      prisma.permission.upsert({
        where: { name: 'manage_prescriptions' },
        update: {},
        create: { name: 'manage_prescriptions' }
      }),
      prisma.permission.upsert({
        where: { name: 'manage_complaints' },
        update: {},
        create: { name: 'manage_complaints' }
      }),
      prisma.permission.upsert({
        where: { name: 'view_reports' },
        update: {},
        create: { name: 'view_reports' }
      })
    ]);

    console.log('✅ Permissions created:', permissions.map(p => p.name));

    // Hash passwords
    const hashPassword = async (password: string) => {
      return await hashPassword(password);
    };

    // Create admin user
    console.log('👑 Creating admin user...');
    const adminRole = roles.find(r => r.name === 'admin');
    const adminUser = await prisma.user.create({
      data: {
        name: 'System Administrator',
        email: 'admin@globalpharmacy.com',
        password: await hashPassword('admin123'),
        address: '123 Pharmacy Street, London, UK',
        roleId: adminRole?.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Admin user created:', adminUser.email);

    // Create staff users
    console.log('👥 Creating staff users...');
    const staffUsers = await Promise.all([
      prisma.staff.create({
        data: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@globalpharmacy.com',
          address: '456 Medical Avenue, London, UK',
          phone: '+44 20 1234 5678',
          createdAt: new Date()
        }
      }),
      prisma.staff.create({
        data: {
          name: 'PharmD Michael Brown',
          email: 'michael.brown@globalpharmacy.com', 
          address: '789 Healthcare Road, London, UK',
          phone: '+44 20 8765 4321',
          createdAt: new Date()
        }
      })
    ]);

    console.log('✅ Staff users created:', staffUsers.map(u => u.email));

    // Create customer users
    console.log('👤 Creating customer users...');
    const customerRole = roles.find(r => r.name === 'customer');
    const customerUsers = await Promise.all([
      prisma.user.create({
        data: {
          name: 'John Smith',
          email: 'john.smith@email.com',
          password: await hashPassword('customer123'),
          address: '321 Customer Lane, London, UK',
          nationalInsuranceNumber: 'AB123456C',
          nhsNumber: '1234567890',
          roleId: customerRole?.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.user.create({
        data: {
          name: 'Emma Wilson',
          email: 'emma.wilson@email.com',
          password: await hashPassword('customer123'),
          address: '654 Patient Street, London, UK',
          nationalInsuranceNumber: 'CD789012E',
          nhsNumber: '0987654321',
          roleId: customerRole?.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ]);

    console.log('✅ Customer users created:', customerUsers.map(u => u.email));

    // Create sample prescriptions
    console.log('� Creating prescriptions...');
    const prescriptions = await Promise.all([
      prisma.prescription.create({
        data: {
          userId: customerUsers[0].id,
          staffId: staffUsers[0].id,
          medicine: 'Amoxicillin 500mg',
          dosage: '500mg',
          instructions: 'Take twice daily with food',
          quantity: 2,
          prescriptionText: 'Amoxicillin 500mg - Take twice daily with food for bacterial infection',
          amount: 12.99,
          deliveryAddress: customerUsers[0].address,
          status: 'pending',
          paymentStatus: 'unpaid',
          approvedBy: staffUsers[0].id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.prescription.create({
        data: {
          userId: customerUsers[1].id,
          staffId: staffUsers[1].id,
          medicine: 'Paracetamol 500mg',
          dosage: '500mg',
          instructions: 'Take as needed for pain, maximum 4 times daily',
          quantity: 1,
          prescriptionText: 'Paracetamol 500mg - For chronic pain management',
          amount: 5.99,
          deliveryAddress: customerUsers[1].address,
          status: 'approved',
          paymentStatus: 'paid',
          approvedBy: staffUsers[1].id,
          approvedAt: new Date(),
          paidAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ]);

    console.log('✅ Prescriptions created:', prescriptions.length);

    // Create sample complaints
    console.log('📞 Creating complaints...');
    const complaints = await Promise.all([
      prisma.complaint.create({
        data: {
          userId: customerUsers[0].id,
          title: 'Long wait time at pharmacy',
          description: 'Had to wait over 30 minutes to collect prescription',
          category: 'service',
          priority: 'medium',
          status: 'received',
          assignedToId: staffUsers[0].id,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }),
      prisma.complaint.create({
        data: {
          userId: customerUsers[1].id,
          title: 'Incorrect medication provided',
          description: 'Received wrong dosage of prescribed medication',
          category: 'product',
          priority: 'high',
          status: 'investigating',
          assignedToId: staffUsers[1].id,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ]);

    console.log('✅ Complaints created:', complaints.length);

    // Create sample contact messages
    console.log('📬 Creating contact messages...');
    const contacts = await Promise.all([
      prisma.contact.create({
        data: {
          name: 'Jane Doe',
          email: 'jane.doe@email.com',
          message: 'I would like to know more about your prescription delivery services.',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    ]);

    console.log('✅ Contact messages created:', contacts.length);

    // Get final counts
    const finalCounts = {
      users: await prisma.user.count(),
      staff: await prisma.staff.count(),
      roles: await prisma.role.count(),
      permissions: await prisma.permission.count(),
      prescriptions: await prisma.prescription.count(),
      complaints: await prisma.complaint.count(),
      contacts: await prisma.contact.count()
    };

    console.log('🎉 Production database setup completed!');

    return NextResponse.json({
      success: true,
      message: 'Production database setup completed successfully!',
      data: {
        summary: finalCounts,
        testAccounts: {
          admin: { email: 'admin@globalpharmacy.com', password: 'admin123' },
          staff: [
            { email: 'sarah.johnson@globalpharmacy.com', password: 'N/A (Staff records)' },
            { email: 'michael.brown@globalpharmacy.com', password: 'N/A (Staff records)' }
          ],
          customers: [
            { email: 'john.smith@email.com', password: 'customer123' },
            { email: 'emma.wilson@email.com', password: 'customer123' }
          ]
        }
      }
    });

  } catch (error) {
    console.error('❌ Production setup failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Production database setup failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Production database setup endpoint. Use POST method to initialize the database.',
    status: 'ready'
  });
}
