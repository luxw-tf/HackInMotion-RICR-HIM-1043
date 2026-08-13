import Anthropic from "@anthropic-ai/sdk";

export interface ParsedClaudeTransaction {
  date: string;
  description: string;
  merchant: string;
  amount: number;
  type: "EXPENSE" | "INCOME" | "SAVINGS";
  categoryName: string;
  isEssential: boolean;
  reasoning: string;
}

/**
 * Sends a raw bank statement (CSV or text dump) directly to Claude.
 * Claude parses dates, extracts clean merchant entities, calculates debits/credits,
 * categorizes into standard taxonomy, and returns a clean structured transaction list.
 */
export async function parseStatementWithClaude(
  statementContent: string,
  accountHolderName: string = "Account Holder"
): Promise<ParsedClaudeTransaction[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured.");
  }

  const anthropic = new Anthropic({ apiKey });

  // Limit raw input to safe chunk size (approx 15,000 characters) to keep response fast and reliable
  const trimmedStatement = statementContent.trim().slice(0, 25000);

  const systemPrompt = `You are an expert Indian & Global bank statement parser and transaction categorizer.
Your job is to read raw bank statement text or CSV (from any bank: HDFC, SBI, ICICI, Axis, Kotak, Chase, BoA, UPI statements, etc.) for account holder "${accountHolderName}" and extract every valid transaction.

For each transaction, determine:
1. "date": ISO format "YYYY-MM-DD"
2. "description": Clean original narration
3. "merchant": Canonical merchant / counterparty name (e.g., "Swiggy", "Blinkit", "Infosys", "Mukesh S")
4. "amount": Positive numeric amount in INR/currency (e.g. 450.00)
5. "type": "EXPENSE" (for debits/outflows), "INCOME" (for credits/salary/refunds), or "SAVINGS" (for transfers to investments/savings)
6. "categoryName": Exactly ONE of:
   - "Food & Dining"
   - "Rent & Housing"
   - "Shopping & Personal"
   - "Subscriptions & Recurring"
   - "Travel & Transport"
   - "Utilities & Bills"
   - "Entertainment & Leisure"
   - "Healthcare & Medical"
   - "Income & Salary"
   - "Uncategorized"
7. "isEssential": boolean (true for rent, groceries, utilities, fuel, medical, salary; false for dining, shopping, movies, luxury)
8. "reasoning": 1-sentence explanation of category and merchant identification

Return ONLY a raw JSON array:
[
  {
    "date": "2026-08-01",
    "description": "UPI/DR/622450640912/MUKESH S/YESB/paytm.s22m/UPI",
    "merchant": "Mukesh S",
    "amount": 450.00,
    "type": "EXPENSE",
    "categoryName": "Food & Dining",
    "isEssential": false,
    "reasoning": "Local food vendor payment via UPI QR code"
  }
]
Do not include markdown codeblocks or commentary. ONLY return the JSON array.`;

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    temperature: 0.1,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Parse and categorize all transactions in this statement:\n\n${trimmedStatement}`,
      },
    ],
  });

  const responseText = message.content[0].type === "text" ? message.content[0].text : "";
  let cleanedJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();

  const firstBracket = cleanedJson.indexOf("[");
  const lastBracket = cleanedJson.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1) {
    cleanedJson = cleanedJson.slice(firstBracket, lastBracket + 1);
  }

  const transactions: ParsedClaudeTransaction[] = JSON.parse(cleanedJson);
  return transactions;
}
