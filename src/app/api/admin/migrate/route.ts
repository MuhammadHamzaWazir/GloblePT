import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json();
    
    // Simple admin key check
    if (adminKey !== 'global-pharma-admin-2024') {
      return NextResponse.json({ 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    console.log('🔄 Running database migration...');

    // First, check database connection and current schema
    try {
      const dbInfo = await prisma.$queryRaw`SELECT DATABASE() as current_db`;
      console.log('Current database:', dbInfo);

      const tables = await prisma.$queryRaw`SHOW TABLES`;
      console.log('Available tables:', tables);

      // Check current User table structure
      const userTableStructure = await prisma.$queryRaw`DESCRIBE User`;
      console.log('Current User table structure:', userTableStructure);

      // Check if columns exist first
      const checkColumns = await prisma.$queryRaw`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'User' 
        AND COLUMN_NAME IN ('emailVerificationCode', 'emailVerificationCodeExpiry', 'emailVerificationAttempts', 'lastEmailVerificationSent', 'twoFactorEnabled', 'twoFactorSecret', 'twoFactorBackupCodes')
      `;
      
      console.log('Existing 2FA columns:', checkColumns);

      if ((checkColumns as any[]).length >= 7) {
        return NextResponse.json({
          success: true,
          message: 'All 2FA columns already exist',
          existingColumns: checkColumns
        }, { status: 200 });
      }

      // Add missing columns one by one
      const migrations = [
        { sql: `ALTER TABLE User ADD COLUMN emailVerificationCode VARCHAR(191) NULL`, name: 'emailVerificationCode' },
        { sql: `ALTER TABLE User ADD COLUMN emailVerificationCodeExpiry DATETIME(3) NULL`, name: 'emailVerificationCodeExpiry' },
        { sql: `ALTER TABLE User ADD COLUMN emailVerificationAttempts INTEGER NOT NULL DEFAULT 0`, name: 'emailVerificationAttempts' },
        { sql: `ALTER TABLE User ADD COLUMN lastEmailVerificationSent DATETIME(3) NULL`, name: 'lastEmailVerificationSent' },
        { sql: `ALTER TABLE User ADD COLUMN twoFactorEnabled BOOLEAN NOT NULL DEFAULT false`, name: 'twoFactorEnabled' },
        { sql: `ALTER TABLE User ADD COLUMN twoFactorSecret VARCHAR(191) NULL`, name: 'twoFactorSecret' },
        { sql: `ALTER TABLE User ADD COLUMN twoFactorBackupCodes VARCHAR(191) NULL`, name: 'twoFactorBackupCodes' }
      ];

      const results = [];
      for (const migration of migrations) {
        try {
          await prisma.$executeRawUnsafe(migration.sql);
          console.log('✅ Added column:', migration.name);
          results.push({ column: migration.name, status: 'added' });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.log('⚠️ Column may already exist:', migration.name, errorMessage);
          results.push({ column: migration.name, status: 'already_exists', error: errorMessage });
        }
      }

      // Verify columns were added
      const finalCheck = await prisma.$queryRaw`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'User' 
        AND COLUMN_NAME IN ('emailVerificationCode', 'emailVerificationCodeExpiry', 'emailVerificationAttempts', 'lastEmailVerificationSent', 'twoFactorEnabled', 'twoFactorSecret', 'twoFactorBackupCodes')
      `;

      return NextResponse.json({
        success: true,
        message: 'Database migration completed',
        results,
        finalColumnCheck: finalCheck
      }, { status: 200 });

    } catch (error) {
      console.error('Migration error:', error);
      return NextResponse.json({
        success: false,
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Database migration error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
