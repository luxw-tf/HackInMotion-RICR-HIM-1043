const { parseBankStatementCSV } = require("../lib/importer/statementParser");

const messyCSVData = [
  // 1. Valid row with DD/MM/YYYY and debit column
  {
    "Txn Date": "14/08/2026",
    "Narration": "SWIGGY BANGALORE ORDER #9921",
    "Withdrawal Amount": "840.00",
    "Deposit Amount": "",
  },
  // 2. Malformed Row: Invalid Date
  {
    "Txn Date": "invalid-date-format",
    "Narration": "ZOMATO RESTAURANT DINING",
    "Withdrawal Amount": "1200.00",
    "Deposit Amount": "",
  },
  // 3. Malformed Row: Missing description
  {
    "Txn Date": "12/08/2026",
    "Narration": "   ",
    "Withdrawal Amount": "450.00",
    "Deposit Amount": "",
  },
  // 4. Malformed Row: Invalid / 0 amount
  {
    "Txn Date": "11/08/2026",
    "Narration": "RELIANCE FRESH VEGGIES",
    "Withdrawal Amount": "0.00",
    "Deposit Amount": "",
  },
  // 5. Valid Row: Textual Date (DD-MMM-YYYY) with Credit column
  {
    "Txn Date": "10-Aug-2026",
    "Narration": "INFOSYS TECH CORP MONTHLY PAYOUT",
    "Withdrawal Amount": "",
    "Deposit Amount": "₹1,25,000.00",
  },
  // 6. Valid Row: Single Amount format with Cr/Dr suffix
  {
    "Txn Date": "08/08/2026",
    "Narration": "AIRTEL FIBER HIGH SPEED BROADBAND",
    "Withdrawal Amount": "1199.00 Dr",
    "Deposit Amount": "",
  },
];

console.log("=== Testing Universal Statement Parser on Messy Data ===");
const result = parseBankStatementCSV(messyCSVData);

console.log("Detected Format:", result.detectedFormat);
console.log("Total Processed:", result.totalRowsProcessed);
console.log("Valid Rows Count:", result.validRows.length);
console.log("Errors / Skipped Rows Count:", result.errors.length);

console.log("\n--- Valid Extracted Rows ---");
result.validRows.forEach((r, i) => {
  console.log(`[${i + 1}] Date: ${r.dateStr} | Narration: "${r.description}" | Type: ${r.type} | Amount: ₹${r.amount}`);
});

console.log("\n--- Row-level Errors / Skipped ---");
result.errors.forEach((e) => {
  console.log(`Row ${e.rowIndex}: ${e.reason}`);
});

const isPassed = result.validRows.length === 3 && result.errors.length === 3;
console.log("\n=== Test Result:", isPassed ? "ALL TESTS PASSED ✅" : "FAILED ❌", "===");

if (!isPassed) process.exit(1);
