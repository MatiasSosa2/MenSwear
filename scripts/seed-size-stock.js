require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const p = new PrismaClient();

// Para cada producto definimos el stock por talle.
// XS tiene menos stock a propósito; musculosa-algodon-flame queda en 0 en XS para probar el bloqueo.
const sizeStockData = [
  {
    slug: "remera-algodon-pima-regular",
    sizeStocks: { S: 2, M: 8, L: 10, XL: 6, XXL: 5 },
  },
  {
    slug: "camisa-lino-premium-blend",
    sizeStocks: { S: 1, M: 7, L: 9, XL: 5 },
  },
  {
    slug: "chomba-pique-mercenizado",
    sizeStocks: { S: 3, M: 6, L: 8, XL: 5, XXL: 5 },
  },
  {
    slug: "camisaco-gabardina-8oz",
    sizeStocks: { S: 2, M: 5, L: 7, XL: 5 },
  },
  {
    slug: "musculosa-algodon-flame",
    sizeStocks: { S: 0, M: 5, L: 6, XL: 5 },  // S agotado → para testear bloqueo
  },
  {
    slug: "remera-henley-botones",
    sizeStocks: { S: 1, M: 9, L: 11, XL: 6, XXL: 5 },
  },
  {
    slug: "buzo-algodon-rustico-lightweight",
    sizeStocks: { S: 2, M: 6, L: 8, XL: 5, XXL: 5 },
  },
  {
    slug: "pantalon-chino-gabardina-saten",
    sizeStocks: { S: 1, M: 7, L: 9, XL: 6, XXL: 5 },
  },
  {
    slug: "jogger-rustico-poplin-lavado",
    sizeStocks: { S: 2, M: 5, L: 7, XL: 5, XXL: 5 },
  },
  {
    slug: "bermuda-cargo-gabardina",
    sizeStocks: { S: 1, M: 6, L: 8, XL: 5 },
  },
  {
    slug: "boxer-algodon-supima-pack2",
    sizeStocks: { S: 2, M: 8, L: 10, XL: 6, XXL: 5 },
  },
  {
    slug: "remera-manga-larga-modal",
    sizeStocks: { S: 1, M: 5, L: 7, XL: 5, XXL: 5 },
  },
];

async function main() {
  console.log("Cargando stock por talle...\n");

  for (const item of sizeStockData) {
    await p.productStock.upsert({
      where: { slug: item.slug },
      update: { sizeStocks: item.sizeStocks },
      create: { slug: item.slug, sizeStocks: item.sizeStocks },
    });
    const total = Object.values(item.sizeStocks).reduce((a, b) => a + b, 0);
    console.log(`  ${item.slug}: ${total} unidades totales`);
  }

  console.log("\nStock cargado correctamente.");
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
