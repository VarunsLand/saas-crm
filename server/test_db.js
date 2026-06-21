const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const expenses = await prisma.expenseEntry.findMany({ take: 1 });
    console.log("SUCCESS:", expenses);
  } catch (e) {
    console.error("PRISMA ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
