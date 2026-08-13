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

const { parseStatementWithClaude } = require("../lib/importer/directClaudeParser");

const sampleRawBankCSV = `
Txn Date,Description,Ref No,Debit,Credit,Balance
01/08/2026,UPI/DR/622450640912/MUKESH S/YESB/paytm.s22m/UPI,,450.00,,124550.00
02/08/2026,INFOSYS TECH CORP SALARY DIRECT DEPOSIT,,,125000.00,249550.00
03/08/2026,PRESTIGE APARTMENTS MONTHLY RENT TRANSFER,IMPS99120,32000.00,,217550.00
04/08/2026,SWIGGY BANGALORE ORDER #9921,POS4012,720.00,,216830.00
05/08/2026,BESCOM ELECTRICITY BILL PAYMENT,BILL102,2850.00,,213980.00
06/08/2026,NETFLIX INDIA MONTHLY 4K STREAMING,,649.00,,213331.00
07/08/2026,ZERODHA NIFTY 50 INDEX SIP AUTO-DEPOSIT,,30000.00,,183331.00
08/08/2026,AIRTEL FIBER HIGH SPEED BROADBAND,,1199.00,,182132.00
09/08/2026,BLINKIT GROCERIES EXPRESS DELIVERY,,1450.00,,180682.00
10/08/2026,UPI/CR/609165199967/Shashwat/JIOP/87997,,,1500.00,182182.00
`;

async function main() {
  console.log("=== Testing Direct Claude Statement Parser ===");
  console.log("Input Raw CSV Dump:\n", sampleRawBankCSV.trim());

  console.log("\nSending raw CSV directly to Claude...");
  const startTime = Date.now();
  const results = await parseStatementWithClaude(sampleRawBankCSV, "Alex Sharma");
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n✅ Claude parsed and categorized ${results.length} transactions in ${elapsed}s!\n`);

  console.log("------------------------------------------------------------------------------------------------------");
  console.log(
    "Date".padEnd(12) +
    "Merchant".padEnd(22) +
    "Amount (₹)".padEnd(12) +
    "Type".padEnd(10) +
    "Category".padEnd(24) +
    "Essential?"
  );
  console.log("------------------------------------------------------------------------------------------------------");

  results.forEach((t) => {
    console.log(
      t.date.padEnd(12) +
      t.merchant.padEnd(22) +
      String(t.amount).padEnd(12) +
      t.type.padEnd(10) +
      t.categoryName.padEnd(24) +
      (t.isEssential ? "Yes" : "No")
    );
    console.log(`  ↳ Reason: ${t.reasoning}`);
  });
  console.log("------------------------------------------------------------------------------------------------------");
}

main().catch(console.error);
