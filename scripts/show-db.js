require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function main() {
  const dbs = await p.$queryRaw`SHOW DATABASES`;
  console.log("Bases de datos en MySQL:");
  dbs.forEach(d => console.log(" -", Object.values(d)[0]));

  const tables = await p.$queryRaw`SHOW TABLES`;
  console.log("\nTablas en ecommerce_db:");
  tables.forEach(t => console.log(" -", Object.values(t)[0]));
}
main().catch(console.error).finally(() => p.$disconnect());
