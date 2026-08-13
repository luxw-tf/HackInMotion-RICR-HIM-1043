const { PrismaClient } = require("@prisma/client");
const { DEMO_TRANSACTIONS } = require("../prisma/seedData");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@smartfinance.app" },
    include: { transactions: true },
  });

  if (!user) throw new Error("Demo user not found");

  if (user.transactions.length === 0) {
    console.log("Seeding transactions for demo user...");
    for (const tx of DEMO_TRANSACTIONS) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          description: tx.description,
          merchant: tx.merchant || tx.description,
          amount: Math.abs(tx.amount),
          type: tx.type,
          date: new Date(tx.date),
          reasoning: tx.reasoning || "Initial seed",
          source: "DEMO_SEED",
        },
      });
    }
    console.log(`Seeded ${DEMO_TRANSACTIONS.length} demo transactions.`);
  } else {
    console.log(`User already has ${user.transactions.length} transactions.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
