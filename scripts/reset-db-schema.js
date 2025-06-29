#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function resetAndSeed() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗄️  Creating fresh database schema...');
    
    // Drop existing tables if they exist
    await prisma.$executeRaw`DROP TABLE IF EXISTS complaint`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS prescription`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS customer`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS staff`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS user`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS _roleTOpermission`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS role`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS permission`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS _prisma_migrations`;
    
    console.log('✅ Dropped existing tables');
    
    // Create fresh schema
    await prisma.$executeRaw`
      CREATE TABLE permission (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY permission_name_key (name)
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE role (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY role_name_key (name)
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE _roleTOpermission (
        A VARCHAR(191) NOT NULL,
        B VARCHAR(191) NOT NULL,
        UNIQUE KEY _roleTOpermission_AB_unique (A, B),
        KEY _roleTOpermission_B_index (B),
        CONSTRAINT _roleTOpermission_A_fkey FOREIGN KEY (A) REFERENCES role (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT _roleTOpermission_B_fkey FOREIGN KEY (B) REFERENCES permission (id) ON DELETE CASCADE ON UPDATE CASCADE
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE user (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        password VARCHAR(191) NOT NULL,
        address TEXT,
        nationalInsuranceNumber VARCHAR(191),
        nhsNumber VARCHAR(191),
        roleId VARCHAR(191) NOT NULL,
        supervisorId VARCHAR(191),
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY user_email_key (email),
        KEY user_roleId_fkey (roleId),
        KEY user_supervisorId_fkey (supervisorId),
        CONSTRAINT user_roleId_fkey FOREIGN KEY (roleId) REFERENCES role (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT user_supervisorId_fkey FOREIGN KEY (supervisorId) REFERENCES user (id) ON DELETE SET NULL ON UPDATE CASCADE
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE staff (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        address TEXT,
        phone VARCHAR(191),
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY staff_email_key (email)
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE customer (
        id VARCHAR(191) NOT NULL,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        address TEXT,
        phone VARCHAR(191),
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        UNIQUE KEY customer_email_key (email)
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE prescription (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        staffId VARCHAR(191),
        medicine VARCHAR(191) NOT NULL,
        quantity INT NOT NULL,
        amount DOUBLE NOT NULL,
        deliveryAddress TEXT,
        status VARCHAR(191) NOT NULL DEFAULT 'pending',
        paymentStatus VARCHAR(191) NOT NULL DEFAULT 'unpaid',
        approvedBy VARCHAR(191),
        prescriptionText TEXT,
        dosage VARCHAR(191),
        instructions TEXT,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY prescription_userId_fkey (userId),
        KEY prescription_staffId_fkey (staffId),
        KEY prescription_approvedBy_fkey (approvedBy),
        CONSTRAINT prescription_userId_fkey FOREIGN KEY (userId) REFERENCES user (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT prescription_staffId_fkey FOREIGN KEY (staffId) REFERENCES staff (id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT prescription_approvedBy_fkey FOREIGN KEY (approvedBy) REFERENCES user (id) ON DELETE SET NULL ON UPDATE CASCADE
      )
    `;
    
    await prisma.$executeRaw`
      CREATE TABLE complaint (
        id VARCHAR(191) NOT NULL,
        userId VARCHAR(191) NOT NULL,
        title VARCHAR(191) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(191) NOT NULL,
        priority VARCHAR(191) NOT NULL DEFAULT 'medium',
        status VARCHAR(191) NOT NULL DEFAULT 'received',
        assignedToId VARCHAR(191),
        assignedById VARCHAR(191),
        resolvedById VARCHAR(191),
        resolution TEXT,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        KEY complaint_userId_fkey (userId),
        KEY complaint_assignedToId_fkey (assignedToId),
        KEY complaint_assignedById_fkey (assignedById),
        KEY complaint_resolvedById_fkey (resolvedById),
        CONSTRAINT complaint_userId_fkey FOREIGN KEY (userId) REFERENCES user (id) ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT complaint_assignedToId_fkey FOREIGN KEY (assignedToId) REFERENCES staff (id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT complaint_assignedById_fkey FOREIGN KEY (assignedById) REFERENCES user (id) ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT complaint_resolvedById_fkey FOREIGN KEY (resolvedById) REFERENCES user (id) ON DELETE SET NULL ON UPDATE CASCADE
      )
    `;
    
    console.log('✅ Created fresh database schema');
    console.log('🌱 Database is ready for seeding');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndSeed();
