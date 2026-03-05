// check-orders.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.order.count();
    console.log(`Total orders: ${count}`);
    
    if (count > 0) {
      const lastOrder = await prisma.order.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { items: true }
      });
      console.log('Last order:', JSON.stringify(lastOrder, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
