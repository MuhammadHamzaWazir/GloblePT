import { PrismaClient } from '@prisma/client'

declare global {
  // Prevent multiple instances of Prisma Client in development
  var prisma: PrismaClient | undefined
}

const prisma = globalThis.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export { prisma }

// Database connection helper for MySQL
export async function connectDB() {
  try {
    await prisma.$connect()
    console.log('✅ MySQL Database connected successfully')
    
    // Test the connection with a simple query
    await prisma.$executeRaw`SELECT 1`
    console.log('✅ Database connection test successful')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    throw error
  }
}

// Database disconnection helper
export async function disconnectDB() {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Database disconnection failed:', error)
  }
}

// Database health check for MySQL
export async function checkDBHealth() {
  try {
    await prisma.$executeRaw`SELECT 1`
    console.log('✅ Database health check passed')
    return true
  } catch (error) {
    console.error('❌ Database health check failed:', error)
    return false
  }
}

// Get database info
export async function getDatabaseInfo() {
  try {
    const result = await prisma.$executeRaw`SELECT VERSION() as version`
    return result
  } catch (error) {
    console.error('❌ Failed to get database info:', error)
    return null
  }
}
