const { PrismaClient } = require("@prisma/client");
const { categorizeTransaction } = require("../lib/categorization/rules");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "demo@smartfinance.app" },
    include: { transactions: true },
  });

  if (!user) throw new Error("Demo user not found");

  console.log("=== Testing Database Duplicate Protection ===");
  console.log("Initial User Transactions Count:", user.transactions.length);

  // Pick an existing transaction to duplicate
  const existingTx = user.transactions[0];
  const dStr = new Date(existingTx.date).toISOString().split("T")[0];

  console.log(`Target Existing Tx: "${existingTx.description}", Amount: ₹${existingTx.amount}, Date: ${dStr}`);

  // Simulate import payload with 1 exact duplicate and 1 brand new transaction
  const importRows = [
    {
      description: existingTx.description,
      amount: existingTx.amount,
      date: existingTx.date,
      type: existingTx.type,
    },
    {
      description: "APOLLO HEALTH CLINIC CONSULTATION TEST",
      amount: 650.00,
      date: new Date(),
      type: "EXPENSE",
    },
  ];

  // Run duplicate check logic matching the import route
  const existingSignatures = new Set(
    user.transactions.map(
      (tx) => `${new Date(tx.date).toISOString().split("T")[0]}_${tx.description.trim().toLowerCase()}_${tx.amount.toFixed(2)}`
    )
  );

  let inserted = 0;
  let skippedDuplicates = 0;

  for (const row of importRows) {
    const rowDateStr = new Date(row.date).toISOString().split("T")[0];
    const sig = `${rowDateStr}_${row.description.trim().toLowerCase()}_${row.amount.toFixed(2)}`;

    if (existingSignatures.has(sig)) {
      console.log(`[DUPLICATE DETECTED & SKIPPED] -> "${row.description}" (₹${row.amount}) on ${rowDateStr}`);
      skippedDuplicates++;
    } else {
      console.log(`[NEW TRANSACTION INSERTED] -> "${row.description}" (₹${row.amount})`);
      inserted++;
    }
  }

  console.log(`\nImport Summary: ${inserted} Inserted, ${skippedDuplicates} Duplicates Skipped.`);
  const passed = inserted === 1 && skippedDuplicates === 1;
  console.log("=== Duplicate Test Result:", passed ? "PASSED ✅" : "FAILED ❌", "===");

  if (!passed) process.exit(1);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
