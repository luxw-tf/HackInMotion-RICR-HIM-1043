const { extractCounterpartyKey, groupTransactionsByCounterparty } = require("../lib/categorization/counterparty");

const testDataset = [
  // 1. Mukesh S via 2 different UPI QR codes & reference numbers
  { description: "UPI/DR/622450640912/MUKESH S/YESB/paytm.s22m/UPI", amount: 450.00, date: "2026-08-01" },
  { description: "UPI/DR/883910248102/MUKESH S/HDFC/mukesh.qr@oksbi/UPI", amount: 380.00, date: "2026-08-05" },
  { description: "UPI/MUKESH S/paytm-qr-1092/UPI", amount: 520.00, date: "2026-08-10" },

  // 2. Shashwat via 2 different VPAs
  { description: "UPI/CR/609165199967/Shashwat/JIOP/87997", amount: 1500.00, date: "2026-08-02" },
  { description: "UPI/CR/991204812048/Shashwat/PYTM/shashwat@paytm", amount: 2000.00, date: "2026-08-12" },

  // 3. Swiggy via POS, Food, and Instamart
  { description: "SWIGGY BANGALORE ORDER #9921", amount: 720.00, date: "2026-08-03" },
  { description: "SWIGGY INSTAMART ESSENTIALS", amount: 890.00, date: "2026-08-07" },
  { description: "UPI/DR/4819204128/SWIGGY/HDFC/swiggy@hdfc", amount: 640.00, date: "2026-08-11" },

  // 4. Blinkit via delivery and card swipe
  { description: "BLINKIT GROCERIES EXPRESS DELIVERY", amount: 1450.00, date: "2026-08-04" },
  { description: "POS 4092 BLINKIT BANGALORE IN", amount: 1280.00, date: "2026-08-09" },

  // 5. Infosys Salary via Direct Deposit and NEFT
  { description: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, date: "2026-07-31" },
  { description: "NEFT-INF12345678-INFOSYS TECH CORP-SALARY", amount: 125000.00, date: "2026-08-31" },

  // 6. Prestige Apartments via Rent Transfer and IMPS
  { description: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, date: "2026-08-01" },
  { description: "IMPS/P2A/622450640912/PRESTIGE APARTMENTS/HDFC", amount: 32000.00, date: "2026-07-01" },

  // 7. Netflix via Monthly streaming and ACH
  { description: "NETFLIX INDIA MONTHLY 4K STREAMING", amount: 649.00, date: "2026-08-06" },
  { description: "ACH DR-NETFLIX ENTERTAINMENT-140826", amount: 649.00, date: "2026-07-06" },

  // 8. Single occurrence items
  { description: "BESCOM ELECTRICITY BILL PAYMENT", amount: 2850.00, date: "2026-08-05" },
  { description: "AIRTEL FIBER HIGH SPEED BROADBAND", amount: 1199.00, date: "2026-08-08" },
  { description: "ZERODHA NIFTY 50 INDEX SIP AUTO-DEPOSIT", amount: 30000.00, date: "2026-08-02" },
];

console.log("=== Testing Counterparty Key Extraction & Grouping ===");
console.log(`Total Input Raw Transactions: ${testDataset.length}`);

const grouped = groupTransactionsByCounterparty(testDataset);

console.log(`Distinct Counterparty Entities Extracted: ${grouped.length}`);
console.log(`Deduplication Compression Ratio: ${((1 - grouped.length / testDataset.length) * 100).toFixed(1)}% reduction\n`);

console.log("----------------------------------------------------------------------------------");
console.log(
  "Normalized Counterparty Key".padEnd(26) +
  "Count".padEnd(8) +
  "Typical (₹)".padEnd(14) +
  "Total (₹)".padEnd(14) +
  "Sample Raw Narration"
);
console.log("----------------------------------------------------------------------------------");

grouped.forEach((g) => {
  console.log(
    g.counterpartyKey.padEnd(26) +
    String(g.transactionCount).padEnd(8) +
    String(g.typicalAmount).padEnd(14) +
    String(g.totalAmount).padEnd(14) +
    g.sampleNarration
  );
  if (g.rawNarrations.length > 1) {
    console.log("  ↳ Collapsed Variations (" + g.rawNarrations.length + "):");
    g.rawNarrations.forEach((r) => console.log("     • " + r));
  }
});
console.log("----------------------------------------------------------------------------------");
