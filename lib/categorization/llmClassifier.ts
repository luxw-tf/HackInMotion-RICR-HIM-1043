import Anthropic from "@anthropic-ai/sdk";
import { GroupedCounterparty, groupTransactionsByCounterparty } from "./counterparty";

export type SemanticFlag =
  | "Self Transfer"
  | "Family Transfer"
  | "Reversal"
  | "Cash Withdrawal"
  | "Bank Fee"
  | "Recurring Income"
  | "Discretionary Expense"
  | "Essential Expense"
  | "Needs Review";

export interface CounterpartyClassification {
  counterpartyKey: string;
  category: string;
  semanticFlag: SemanticFlag;
  isEssential: boolean;
  confidence: number;
  reasoning: string;
}

export interface BatchClassificationResult {
  totalTransactions: number;
  distinctCounterparties: number;
  apiCallsMade: number;
  reductionPercentage: number;
  cachedHits: number;
  classifications: CounterpartyClassification[];
}

// In-memory cache for counterparty classification across the session
const counterpartyCache = new Map<string, CounterpartyClassification>();

/**
 * Classifies a batch of unique counterparty keys using Claude 3.5 Sonnet / Haiku.
 * Batches 20-30 counterparties per API call for maximum token efficiency.
 */
export async function classifyCounterpartiesWithClaude(
  groupedCounterparties: GroupedCounterparty[],
  accountHolderName: string = "Account Holder",
  batchSize: number = 25
): Promise<BatchClassificationResult> {
  const totalTransactions = groupedCounterparties.reduce((sum, g) => sum + g.transactionCount, 0);
  const distinctCounterparties = groupedCounterparties.length;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const anthropic = apiKey ? new Anthropic({ apiKey }) : null;

  const toClassify: GroupedCounterparty[] = [];
  const results: CounterpartyClassification[] = [];
  let cachedHits = 0;

  // Check cache first
  for (const group of groupedCounterparties) {
    if (counterpartyCache.has(group.counterpartyKey)) {
      results.push(counterpartyCache.get(group.counterpartyKey)!);
      cachedHits++;
    } else {
      toClassify.push(group);
    }
  }

  let apiCallsMade = 0;

  // Process uncached counterparties in batches of 20-30
  for (let i = 0; i < toClassify.length; i += batchSize) {
    const batch = toClassify.slice(i, i + batchSize);
    apiCallsMade++;

    if (!anthropic) {
      console.warn("ANTHROPIC_API_KEY not configured, using fallback rule engine.");
      batch.forEach((item) => {
        const fallback: CounterpartyClassification = {
          counterpartyKey: item.counterpartyKey,
          category: "Uncategorized",
          semanticFlag: "Needs Review",
          isEssential: false,
          confidence: 0.5,
          reasoning: "Rule fallback (no API key configured)",
        };
        counterpartyCache.set(item.counterpartyKey, fallback);
        results.push(fallback);
      });
      continue;
    }

    const promptPayload = batch.map((item) => ({
      counterpartyKey: item.counterpartyKey,
      sampleNarration: item.sampleNarration,
      typicalAmountINR: item.typicalAmount,
      totalVolumeINR: item.totalAmount,
      transactionCount: item.transactionCount,
    }));

    const systemPrompt = `You are an expert Indian & Global financial transaction classifier.
Your task is to classify bank & UPI counterparties for account holder: "${accountHolderName}".

Categories must be one of:
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

Semantic flags must be strictly one of:
- "Self Transfer" (Transfers between user's own accounts/wallets)
- "Family Transfer" (P2P transfers to individuals / friends / family)
- "Reversal" (Refunds, failed transaction reversals)
- "Cash Withdrawal" (ATM cash out)
- "Bank Fee" (Charges, interest debit, penalty)
- "Recurring Income" (Salary, client retainer, dividends)
- "Discretionary Expense" (Dining, luxury, shopping, entertainment)
- "Essential Expense" (Groceries, rent, electricity, healthcare, fuel)
- "Needs Review" (Ambiguous personal transfers)

Return a strictly valid JSON array of objects with fields:
[
  {
    "counterpartyKey": string,
    "category": string,
    "semanticFlag": SemanticFlag,
    "isEssential": boolean,
    "confidence": number (0.0 to 1.0),
    "reasoning": string (concise explanation)
  }
]
Do not include markdown codeblocks or conversational text, ONLY raw JSON.`;

    try {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Classify the following batch of ${batch.length} counterparties:\n${JSON.stringify(promptPayload, null, 2)}`,
          },
        ],
      });



      const responseText = message.content[0].type === "text" ? message.content[0].text : "";
      const cleanedJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsedArray: CounterpartyClassification[] = JSON.parse(cleanedJson);

      parsedArray.forEach((cls) => {
        counterpartyCache.set(cls.counterpartyKey, cls);
        results.push(cls);
      });
    } catch (err) {
      console.error("Claude batch classification error:", err);
      // Fallback on error for this batch
      batch.forEach((item) => {
        const fallback: CounterpartyClassification = {
          counterpartyKey: item.counterpartyKey,
          category: "Uncategorized",
          semanticFlag: "Needs Review",
          isEssential: false,
          confidence: 0.4,
          reasoning: "Classification exception fallback",
        };
        counterpartyCache.set(item.counterpartyKey, fallback);
        results.push(fallback);
      });
    }
  }

  const reductionPercentage = totalTransactions > 0
    ? Math.round((1 - distinctCounterparties / totalTransactions) * 100)
    : 0;

  return {
    totalTransactions,
    distinctCounterparties,
    apiCallsMade,
    reductionPercentage,
    cachedHits,
    classifications: results,
  };
}
