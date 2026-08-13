const { PrismaClient } = require("@prisma/client");
const { groupTransactionsByCounterparty } = require("../lib/categorization/counterparty");
const { classifyCounterpartiesWithClaude } = require("../lib/categorization/llmClassifier");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@smartfinance.app" },
    include: { transactions: true },
  });

  if (!user) throw new Error("Demo user not found");

  console.log(`Found ${user.transactions.length} transactions for user ${user.email}`);

  const grouped = groupTransactionsByCounterparty(user.transactions);
  console.log(`Grouped into ${grouped.length} distinct counterparties:`, grouped.map(g => g.counterpartyKey));

  const result = await classifyCounterpartiesWithClaude(grouped, user.name || "Demo User", 25);
  console.log("Classification result:", result.metrics || result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
