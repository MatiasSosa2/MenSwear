require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("MAtias_2222", 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@tienda.com" },
    update: { name: "Matias", password: hashed, role: "OWNER" },
    create: { email: "admin@tienda.com", name: "Matias", password: hashed, role: "OWNER" },
  });
  console.log("✅ Admin creado:", admin.email, "- ID:", admin.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
