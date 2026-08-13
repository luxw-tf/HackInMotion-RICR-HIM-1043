const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@smartfinance.app" },
    include: {
      financialAccounts: true,
      transactions: true,
      savingsGoals: true,
      budgets: true,
    },
  });

  if (!user) {
    throw new Error("Test user not found!");
  }

  const isPasswordValid = await bcrypt.compare("password123", user.password);

  console.log("=== Auth & Data Scoping Verification ===");
  console.log("User Email:", user.email);
  console.log("Password Hash Check:", isPasswordValid ? "PASSED (Valid)" : "FAILED");
  console.log("First-Class Accounts:", user.financialAccounts.map((a) => `${a.name} (${a.type})`));
  console.log("Scoped Transactions Count:", user.transactions.length);
  console.log("Scoped Savings Goals:", user.savingsGoals.map((g) => `${g.name}: ₹${g.currentAmount}/₹${g.targetAmount}`));
  console.log("Scoped Budgets Count:", user.budgets.length);
  console.log("=========================================");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
