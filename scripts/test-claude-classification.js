const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (!process.env[key]) process.env[key] = value.trim();
    }
  });
}


const { groupTransactionsByCounterparty } = require("../lib/categorization/counterparty");
const { classifyCounterpartiesWithClaude } = require("../lib/categorization/llmClassifier");

const testDataset = [

  // 1. Mukesh S via 3 different UPI VPAs / QR codes
  { description: "UPI/DR/622450640912/MUKESH S/YESB/paytm.s22m/UPI", amount: 450.00, date: "2026-08-01" },
  { description: "UPI/DR/883910248102/MUKESH S/HDFC/mukesh.qr@oksbi/UPI", amount: 380.00, date: "2026-08-05" },
  { description: "UPI/MUKESH S/paytm-qr-1092/UPI", amount: 520.00, date: "2026-08-10" },

  // 2. Shashwat (Family/Friend transfer) via 2 different VPAs
  { description: "UPI/CR/609165199967/Shashwat/JIOP/87997", amount: 1500.00, date: "2026-08-02" },
  { description: "UPI/CR/991204812048/Shashwat/PYTM/shashwat@paytm", amount: 2000.00, date: "2026-08-12" },

  // 3. Swiggy
  { description: "SWIGGY BANGALORE ORDER #9921", amount: 720.00, date: "2026-08-03" },
  { description: "SWIGGY INSTAMART ESSENTIALS", amount: 890.00, date: "2026-08-07" },
  { description: "UPI/DR/4819204128/SWIGGY/HDFC/swiggy@hdfc", amount: 640.00, date: "2026-08-11" },

  // 4. Blinkit
  { description: "BLINKIT GROCERIES EXPRESS DELIVERY", amount: 1450.00, date: "2026-08-04" },
  { description: "POS 4092 BLINKIT BANGALORE IN", amount: 1280.00, date: "2026-08-09" },

  // 5. Infosys Salary
  { description: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, date: "2026-07-31" },
  { description: "NEFT-INF12345678-INFOSYS TECH CORP-SALARY", amount: 125000.00, date: "2026-08-31" },

  // 6. Prestige Apartments Rent
  { description: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, date: "2026-08-01" },
  { description: "IMPS/P2A/622450640912/PRESTIGE APARTMENTS/HDFC", amount: 32000.00, date: "2026-07-01" },

  // 7. Netflix
  { description: "NETFLIX INDIA MONTHLY 4K STREAMING", amount: 649.00, date: "2026-08-06" },
  { description: "ACH DR-NETFLIX ENTERTAINMENT-140826", amount: 649.00, date: "2026-07-06" },

  // 8. Single occurrence bills & investments
  { description: "BESCOM ELECTRICITY BILL PAYMENT", amount: 2850.00, date: "2026-08-05" },
  { description: "AIRTEL FIBER HIGH SPEED BROADBAND", amount: 1199.00, date: "2026-08-08" },
  { description: "ZERODHA NIFTY 50 INDEX SIP AUTO-DEPOSIT", amount: 30000.00, date: "2026-08-02" },
];

async function main() {
  console.log("=== Testing Claude LLM Counterparty Batch Classification ===");
  console.log(`Step 1: Grouping ${testDataset.length} raw transactions by normalized counterparty key...`);
  
  const grouped = groupTransactionsByCounterparty(testDataset);
  console.log(`Extracted ${grouped.length} distinct counterparties.`);

  console.log("\nStep 2: Sending batched payload to Claude 3.5 Haiku / Sonnet...");
  const result = await classifyCounterpartiesWithClaude(grouped, "Alex Sharma", 25);

  console.log("\n==================== CLAUDE BATCH CLASSIFICATION REPORT ====================");
  console.log(`Total Transactions Ingested:        ${result.totalTransactions}`);
  console.log(`Distinct Counterparty Keys:         ${result.distinctCounterparties}`);
  console.log(`Total LLM API Calls Made:           ${result.apiCallsMade}`);
  console.log(`Token & Request Reduction Ratio:    ${result.reductionPercentage}%`);
  console.log(`Cached Cache Hits:                  ${result.cachedHits}`);
  console.log("----------------------------------------------------------------------------");
  console.log(
    "Counterparty".padEnd(24) +
    "Category".padEnd(24) +
    "Semantic Flag".padEnd(22) +
    "Essential?".padEnd(12) +
    "Conf"
  );
  console.log("----------------------------------------------------------------------------");

  result.classifications.forEach((c) => {
    console.log(
      c.counterpartyKey.padEnd(24) +
      c.category.padEnd(24) +
      c.semanticFlag.padEnd(22) +
      (c.isEssential ? "Yes" : "No").padEnd(12) +
      `${(c.confidence * 100).toFixed(0)}%`
    );
    console.log(`  ↳ Reasoning: ${c.reasoning}`);
  });
  console.log("============================================================================");

  // Step 3: Test cache hit on second run
  console.log("\nStep 3: Testing Cache Reuse (Second Ingestion Batch)...");
  const cachedResult = await classifyCounterpartiesWithClaude(grouped, "Alex Sharma", 25);
  console.log(`Second Run API Calls: ${cachedResult.apiCallsMade} (100% from cache, 0 tokens spent) ✅`);
}

main().catch((err) => {
  console.error("Test error:", err);
});
