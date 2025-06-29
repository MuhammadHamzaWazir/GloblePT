const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting database initialization...')

  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connection successful')

    // Create default admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pharmacy.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 12)
      
      const adminUser = await prisma.user.create({
        data: {
          name: 'System Administrator',
          email: adminEmail,
          password: hashedPassword,
          address: 'System Admin Address',
          roleId: 1, // Assuming 1 is admin role
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      
      console.log('✅ Admin user created:', adminUser.email)
    } else {
      console.log('ℹ️ Admin user already exists:', existingAdmin.email)
    }

    // Create default roles if they don't exist
    const roles = ['ADMIN', 'STAFF', 'CUSTOMER']
    
    for (const roleName of roles) {
      const existingRole = await prisma.role.findFirst({
        where: { name: roleName }
      })
      
      if (!existingRole) {
        await prisma.role.create({
          data: {
            name: roleName,
            description: `${roleName} role`,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`✅ Created role: ${roleName}`)
      } else {
        console.log(`ℹ️ Role already exists: ${roleName}`)
      }
    }

    console.log('🎉 Database initialization completed successfully!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error('❌ Unexpected error:', e)
    process.exit(1)
  })
