const prisma = require("./prismaClient");
const bcrypt = require("bcryptjs");

async function main() {
  // Create roles
  const roles = ["admin", "staff", "assistant", "customer"];
  const roleRecords = {};
  for (const name of roles) {
    roleRecords[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Create users
  const users = [
    {
      name: "Admin User",
      email: "admin@pharmacy.com",
      password: await bcrypt.hash("admin123", 10),
      roleId: roleRecords["admin"].id,
      address: "123 Admin St",
    },
    {
      name: "Staff User",
      email: "staff@pharmacy.com",
      password: await bcrypt.hash("staff123", 10),
      roleId: roleRecords["staff"].id,
      address: "456 Staff Ave",
    },
    {
      name: "Assistant User",
      email: "assistant@pharmacy.com",
      password: await bcrypt.hash("assistant123", 10),
      roleId: roleRecords["assistant"].id,
      address: "789 Assistant Rd",
    },
    {
      name: "Customer User",
      email: "customer@pharmacy.com",
      password: await bcrypt.hash("customer123", 10),
      roleId: roleRecords["customer"].id,
      address: "321 Customer Blvd",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log("Seeded admin, staff, assistant, and customer users.");
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
