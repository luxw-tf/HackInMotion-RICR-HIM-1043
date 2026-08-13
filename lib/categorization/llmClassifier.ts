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
 * Classifies a batch of unique counterparty keys concurrently using Claude.
 * Uses robust JSON extraction and safe batch size of 15 to prevent token limits and JSON truncation.
 */
export async function classifyCounterpartiesWithClaude(
  groupedCounterparties: GroupedCounterparty[],
  accountHolderName: string = "Account Holder",
  batchSize: number = 15
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
    if (counterpartyCache.has(group.counterpartyKey.toLowerCase())) {
      results.push(counterpartyCache.get(group.counterpartyKey.toLowerCase())!);
      cachedHits++;
    } else {
      toClassify.push(group);
    }
  }

  // Create slices for parallel execution (15 counterparties per call)
  const batches: GroupedCounterparty[][] = [];
  for (let i = 0; i < toClassify.length; i += batchSize) {
    batches.push(toClassify.slice(i, i + batchSize));
  }

  const apiCallsMade = batches.length;

  if (!anthropic || batches.length === 0) {
    if (!anthropic && toClassify.length > 0) {
      console.warn("ANTHROPIC_API_KEY not configured, using fallback.");
      toClassify.forEach((item) => {
        const fallback: CounterpartyClassification = {
          counterpartyKey: item.counterpartyKey,
          category: "Uncategorized",
          semanticFlag: "Needs Review",
          isEssential: false,
          confidence: 0.5,
          reasoning: "Rule fallback (no API key configured)",
        };
        counterpartyCache.set(item.counterpartyKey.toLowerCase(), fallback);
        results.push(fallback);
      });
    }

    const reductionPercentage = totalTransactions > 0
      ? Math.round((1 - distinctCounterparties / totalTransactions) * 100)
      : 0;

    return {
      totalTransactions,
      distinctCounterparties,
      apiCallsMade: 0,
      reductionPercentage,
      cachedHits,
      classifications: results,
    };
  }

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
- "Self Transfer"
- "Family Transfer"
- "Reversal"
- "Cash Withdrawal"
- "Bank Fee"
- "Recurring Income"
- "Discretionary Expense"
- "Essential Expense"
- "Needs Review"

Return ONLY a raw valid JSON array:
[
  {
    "counterpartyKey": string,
    "category": string,
    "semanticFlag": SemanticFlag,
    "isEssential": boolean,
    "confidence": number,
    "reasoning": string
  }
]`;

  // Process all batches in parallel with Promise.all
  const batchPromises = batches.map(async (batch) => {
    const promptPayload = batch.map((item) => ({
      counterpartyKey: item.counterpartyKey,
      sampleNarration: item.sampleNarration,
      typicalAmountINR: item.typicalAmount,
      totalVolumeINR: item.totalAmount,
      transactionCount: item.transactionCount,
    }));

    try {
      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Classify these ${batch.length} counterparties as JSON array:\n${JSON.stringify(promptPayload)}`,
          },
        ],
      });

      const responseText = message.content[0].type === "text" ? message.content[0].text : "";
      
      // Clean JSON markers
      let cleanedJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const firstBracket = cleanedJson.indexOf("[");
      const lastBracket = cleanedJson.lastIndexOf("]");
      if (firstBracket !== -1 && lastBracket !== -1) {
        cleanedJson = cleanedJson.slice(firstBracket, lastBracket + 1);
      }

      const parsedArray: CounterpartyClassification[] = JSON.parse(cleanedJson);
      return parsedArray;
    } catch (err) {
      console.error("Claude batch classification error:", err);
      // Fallback on error for this batch
      return batch.map((item) => ({
        counterpartyKey: item.counterpartyKey,
        category: "Uncategorized",
        semanticFlag: "Needs Review" as SemanticFlag,
        isEssential: false,
        confidence: 0.4,
        reasoning: "Classification fallback",
      }));
    }
  });

  const batchResults = await Promise.all(batchPromises);

  // Flatten and cache all results
  batchResults.forEach((arr) => {
    arr.forEach((cls) => {
      counterpartyCache.set(cls.counterpartyKey.toLowerCase(), cls);
      results.push(cls);
    });
  });

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
