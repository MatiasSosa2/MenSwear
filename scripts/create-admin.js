/**
 * Script para crear el usuario administrador inicial.
 * Ejecutar UNA VEZ: node scripts/create-admin.js
 *
 * Requiere que la base de datos esté configurada y las migraciones aplicadas.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const readline = require("readline");

require("dotenv").config();

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  console.log("\n🔐 Creación de usuario administrador\n");

  const name = await ask("Nombre: ");
  const email = await ask("Email: ");
  const password = await ask("Contraseña (mín. 6 caracteres): ");

  if (password.length < 6) {
    console.error("❌ La contraseña debe tener al menos 6 caracteres.");
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: email.toLowerCase().trim() },
    update: { name: name.trim(), password: hashed, role: "OWNER" },
    create: {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      password: hashed,
      role: "OWNER",
    },
  });

  console.log(`\n✅ Administrador creado: ${admin.email} (ID: ${admin.id})\n`);
  rl.close();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
