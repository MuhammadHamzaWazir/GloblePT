#!/usr/bin/env node

/**
 * Manual Database Migration for Production
 * This script applies the database schema directly to Railway
 */

const mysql = require('mysql2/promise');

// Set the Railway production database URL
const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:aSJaTqBawFjJzCvUyZuUiobxXaTaTfpu@nozomi.proxy.rlwy.net:54948/railway";

console.log('🔗 Using DATABASE_URL:', DATABASE_URL.replace(/:[^:@]*@/, ':****@')); // Hide password in logs

async function migrateDatabase() {
  console.log('🚀 Starting manual database migration...');
  
  let connection;
  
  try {
    // Parse DATABASE_URL
    const url = new URL(DATABASE_URL);
    const config = {
      host: url.hostname,
      port: url.port || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      ssl: {
        rejectUnauthorized: false
      }
    };
    
    console.log('📍 Connecting to database:', config.host);
    connection = await mysql.createConnection(config);
    
    // Check if the User table exists
    console.log('🔍 Checking User table...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'User'");
    
    if (tables.length === 0) {
      console.log('📝 User table does not exist. Creating full schema...');
      
      // Create all tables
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Role (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) UNIQUE NOT NULL
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Permission (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) UNIQUE NOT NULL
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS User (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          address VARCHAR(255) NOT NULL,
          nationalInsuranceNumber VARCHAR(255),
          nhsNumber VARCHAR(255),
          file1Url VARCHAR(255),
          file2Url VARCHAR(255),
          roleId INT,
          supervisorId INT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (roleId) REFERENCES Role(id),
          FOREIGN KEY (supervisorId) REFERENCES User(id)
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Staff (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          address VARCHAR(255) NOT NULL,
          phone VARCHAR(255),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Prescription (
          id INT PRIMARY KEY AUTO_INCREMENT,
          userId INT NOT NULL,
          staffId INT,
          medicine VARCHAR(255) NOT NULL,
          dosage VARCHAR(255),
          instructions VARCHAR(255),
          quantity INT DEFAULT 1,
          prescriptionText TEXT DEFAULT '',
          amount FLOAT NOT NULL,
          deliveryAddress VARCHAR(255) NOT NULL,
          status VARCHAR(255) DEFAULT 'pending',
          paymentStatus VARCHAR(255) DEFAULT 'unpaid',
          stripePaymentIntentId VARCHAR(255),
          stripeChargeId VARCHAR(255),
          paidAt DATETIME,
          approvedBy INT,
          approvedAt DATETIME,
          rejectedReason VARCHAR(255),
          trackingNumber VARCHAR(255),
          dispatchedAt DATETIME,
          deliveredAt DATETIME,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES User(id),
          FOREIGN KEY (staffId) REFERENCES Staff(id),
          FOREIGN KEY (approvedBy) REFERENCES User(id)
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Complaint (
          id INT PRIMARY KEY AUTO_INCREMENT,
          userId INT NOT NULL,
          title VARCHAR(255) DEFAULT 'General Complaint',
          description TEXT DEFAULT 'No description provided',
          category VARCHAR(255) DEFAULT 'service',
          priority VARCHAR(255) DEFAULT 'medium',
          fileUrl VARCHAR(255),
          status VARCHAR(255) DEFAULT 'received',
          assignedToId INT,
          assignedAt DATETIME,
          assignedById INT,
          resolution TEXT,
          resolvedAt DATETIME,
          resolvedById INT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (userId) REFERENCES User(id),
          FOREIGN KEY (assignedToId) REFERENCES Staff(id),
          FOREIGN KEY (assignedById) REFERENCES User(id),
          FOREIGN KEY (resolvedById) REFERENCES User(id)
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Contact (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Customer (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          address VARCHAR(255) NOT NULL,
          phone VARCHAR(255),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS _RolePermissions (
          A INT NOT NULL,
          B INT NOT NULL,
          UNIQUE(A, B),
          FOREIGN KEY (A) REFERENCES Role(id) ON DELETE CASCADE,
          FOREIGN KEY (B) REFERENCES Permission(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ Database schema created successfully!');
      
    } else {
      console.log('✅ User table exists. Checking for supervisorId column...');
      
      // Check if supervisorId column exists
      const [columns] = await connection.execute("SHOW COLUMNS FROM User LIKE 'supervisorId'");
      
      if (columns.length === 0) {
        console.log('📝 Adding supervisorId column to User table...');
        await connection.execute(`
          ALTER TABLE User ADD COLUMN supervisorId INT,
          ADD FOREIGN KEY (supervisorId) REFERENCES User(id)
        `);
        console.log('✅ supervisorId column added successfully!');
      } else {
        console.log('✅ supervisorId column already exists!');
      }
    }
    
    console.log('🎉 Database migration completed successfully!');
    
    // Test the database connection with a simple query
    const [testResult] = await connection.execute('SELECT COUNT(*) as count FROM User');
    console.log(`📊 Current user count: ${testResult[0].count}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
migrateDatabase();
