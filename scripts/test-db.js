const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('🔍 Testing MySQL database connection...')
    
    // Connect to database
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test query
    const result = await prisma.$executeRaw`SELECT 1 as test`
    console.log('✅ Test query successful')
    
    // Get database version
    const version = await prisma.$queryRaw`SELECT VERSION() as version`
    console.log('📊 MySQL Version:', version[0]?.version || 'Unknown')
    
    // Count existing tables
    const tables = await prisma.$queryRaw`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `
    console.log('📋 Tables in database:', tables[0]?.table_count || 0)
    
    // Test user table if it exists
    try {
      const userCount = await prisma.user.count()
      console.log('👤 Users in database:', userCount)
    } catch (error) {
      console.log('ℹ️ User table not accessible or doesn\'t exist yet')
    }
    
    console.log('🎉 All database tests passed!')
    
  } catch (error) {
    console.error('❌ Database connection test failed:')
    console.error('Error details:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure MySQL server is running on port 3306')
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('💡 Check your MySQL username and password')
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 Database "pharmacy_db" doesn\'t exist. Create it first:')
      console.error('   mysql -u root -p -e "CREATE DATABASE pharmacy_db;"')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  }
}

testConnection()
