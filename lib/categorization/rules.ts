export interface CategoryRuleDefinition {
  name: string;
  type: "EXPENSE" | "INCOME" | "SAVINGS";
  isEssential: boolean;
  color: string;
  icon: string;
  description: string;
  keywords: string[];
}

export const DEFAULT_CATEGORY_TAXONOMY: CategoryRuleDefinition[] = [
  {
    name: "Income",
    type: "INCOME",
    isEssential: false,
    color: "#059669", // Emerald
    icon: "TrendingUp",
    description: "Salary, wages, bonuses, client invoices, and incoming transfers",
    keywords: [
      "salary",
      "payroll",
      "direct dep",
      "direct deposit",
      "paycheck",
      "employer",
      "wages",
      "dividend",
      "interest credit",
      "bonus",
      "consulting",
      "freelance",
      "venmo cashout",
      "stripe payout",
      "transfer in",
      "refund",
    ],
  },
  {
    name: "Housing",
    type: "EXPENSE",
    isEssential: true,
    color: "#0284c7", // Sky blue
    icon: "Home",
    description: "Rent, mortgage payments, property taxes, HOA fees, and home maintenance",
    keywords: [
      "rent",
      "mortgage",
      "hoa",
      "property tax",
      "apartment",
      "landlord",
      "realty",
      "leasing",
      "maintenance fee",
      "home depot",
      "lowes",
    ],
  },
  {
    name: "Food & Dining",
    type: "EXPENSE",
    isEssential: true, // Mixed essentials (groceries) / discretionary (dining)
    color: "#f59e0b", // Warm amber
    icon: "Utensils",
    description: "Groceries, supermarkets, restaurants, cafes, and food delivery",
    keywords: [
      "grocery",
      "groceries",
      "supermarket",
      "trader joe",
      "whole foods",
      "safeway",
      "kroger",
      "costco",
      "walmart",
      "target grocery",
      "aldi",
      "restaurant",
      "cafe",
      "coffee",
      "starbucks",
      "dunkin",
      "mcdonald",
      "burger",
      "pizza",
      "doordash",
      "ubereats",
      "grubhub",
      "bistro",
      "bakery",
      "chipotle",
      "panera",
      "sushi",
      "tacos",
    ],
  },
  {
    name: "Transportation",
    type: "EXPENSE",
    isEssential: true,
    color: "#6366f1", // Indigo
    icon: "Car",
    description: "Fuel, public transit, rideshare, parking, auto maintenance & insurance",
    keywords: [
      "gas",
      "fuel",
      "chevron",
      "shell",
      "bp ",
      "exxon",
      "mobil",
      "uber",
      "lyft",
      "transit",
      "metro",
      "subway",
      "mta",
      "train",
      "amtrak",
      "parking",
      "toll",
      "fastrak",
      "auto insurance",
      "geico",
      "state farm",
      "progressive",
      "mechanic",
      "oil change",
      "jiffy lube",
    ],
  },
  {
    name: "Utilities & Bills",
    type: "EXPENSE",
    isEssential: true,
    color: "#0d9488", // Teal
    icon: "Zap",
    description: "Electricity, water, gas, home internet, mobile plan, trash and municipal services",
    keywords: [
      "electric",
      "power",
      "energy",
      "pge",
      "coned",
      "water utility",
      "sewer",
      "gas co",
      "internet",
      "wifi",
      "broadband",
      "comcast",
      "xfinity",
      "verizon",
      "at&t",
      "t-mobile",
      "spectrum",
      "trash",
      "waste",
    ],
  },
  {
    name: "Healthcare",
    type: "EXPENSE",
    isEssential: true,
    color: "#e11d48", // Rose
    icon: "HeartPulse",
    description: "Doctor visits, dental care, prescriptions, pharmacy, therapy, health insurance",
    keywords: [
      "pharmacy",
      "cvs",
      "walgreens",
      "rite aid",
      "hospital",
      "clinic",
      "medical",
      "dental",
      "dentist",
      "doctor",
      "physician",
      "health insurance",
      "optometry",
      "vision",
      "eyecare",
      "therapy",
      "quest diagnostics",
      "labcorp",
    ],
  },
  {
    name: "Entertainment & Leisure",
    type: "EXPENSE",
    isEssential: false,
    color: "#8b5cf6", // Purple
    icon: "Film",
    description: "Streaming subscriptions, cinema, video games, concerts, gym, hobbies",
    keywords: [
      "netflix",
      "spotify",
      "apple music",
      "hulu",
      "disney",
      "hbo",
      "max",
      "youtube premium",
      "cinema",
      "amc",
      "regal",
      "movies",
      "steam",
      "playstation",
      "xbox",
      "nintendo",
      "gym",
      "fitness",
      "equinox",
      "planet fitness",
      "concert",
      "ticketmaster",
      "stubhub",
      "golf",
      "bowling",
    ],
  },
  {
    name: "Shopping & Personal",
    type: "EXPENSE",
    isEssential: false,
    color: "#64748b", // Slate
    icon: "ShoppingBag",
    description: "Clothing, electronics, personal care, home goods, Amazon orders",
    keywords: [
      "amazon",
      "amzn",
      "clothing",
      "apparel",
      "zara",
      "h&m",
      "nike",
      "apple store",
      "best buy",
      "electronics",
      "salon",
      "barber",
      "haircut",
      "sephora",
      "ulta",
      "cosmetics",
      "target",
      "ebay",
      "etsy",
      "ikea",
    ],
  },
  {
    name: "Savings & Investments",
    type: "SAVINGS",
    isEssential: false,
    color: "#10b981", // Brand Green
    icon: "PiggyBank",
    description: "Transfers to high-yield savings, IRA/401k deposits, stocks, index funds",
    keywords: [
      "vanguard",
      "fidelity",
      "schwab",
      "robinhood",
      "coinbase",
      "wealthfront",
      "betterment",
      "401k",
      "ira contribution",
      "savings transfer",
      "hysa",
      "emergency fund",
      "investment",
    ],
  },
];

export interface CategorizationResult {
  categoryName: string;
  type: "EXPENSE" | "INCOME" | "SAVINGS";
  isEssential: boolean;
  confidence: "HIGH" | "MEDIUM" | "FALLBACK";
  reasoning: string;
  cleanedMerchant: string;
}

/**
 * Normalizes raw description to extract cleaner merchant label
 */
export function cleanMerchantName(description: string): string {
  if (!description) return "Unknown Transaction";
  
  let cleaned = description
    .replace(/(?:POS DEBIT|DEBIT CARD PURCHASE|CHECKCARD|ACH DEBIT|WIRE OUT|DIRECT DEBIT|PAYMENT TO)\s+/gi, "")
    .replace(/(?:INC\.|LLC|L\.L\.C\.|CORP\.|CO\.)\b/gi, "")
    .replace(/\s+#?\d{3,}/g, "") // remove store numbers like #1042
    .replace(/\s+\*+[0-9A-Z]+/g, "") // remove transaction tokens like *94819
    .replace(/\s+(?:US|USA|CA|NY|TX|WA|FL)\b/g, "") // trailing state codes
    .replace(/[\*\_\-#]+/g, " ")
    .trim();

  // Capitalize words neatly
  cleaned = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4) // keep first 4 tokens max for clean badge
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return cleaned || description.trim();
}

/**
 * Deterministic rule-based categorization engine
 * Returns assigned category, financial type, essential flag, confidence, and reasoning
 */
export function categorizeTransaction(
  description: string,
  amount: number,
  customRules?: Array<{ categoryName: string; keyword: string; type: "EXPENSE" | "INCOME" | "SAVINGS"; isEssential: boolean }>
): CategorizationResult {
  const normalizedDesc = (description || "").toLowerCase();
  const cleanedMerchant = cleanMerchantName(description);

  // 1. Check custom user-defined keyword rules first (highest precedence)
  if (customRules && customRules.length > 0) {
    for (const rule of customRules) {
      if (normalizedDesc.includes(rule.keyword.toLowerCase())) {
        return {
          categoryName: rule.categoryName,
          type: rule.type,
          isEssential: rule.isEssential,
          confidence: "HIGH",
          reasoning: `Matched custom user rule for keyword "${rule.keyword}"`,
          cleanedMerchant,
        };
      }
    }
  }

  // 2. Check default keyword taxonomy
  for (const category of DEFAULT_CATEGORY_TAXONOMY) {
    for (const keyword of category.keywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b|${keyword.toLowerCase()}`, "i");
      if (regex.test(normalizedDesc)) {
        // Amount heuristic check: If categorized as Income but amount is negative or positive
        const finalType = category.type;
        return {
          categoryName: category.name,
          type: finalType,
          isEssential: category.isEssential,
          confidence: "HIGH",
          reasoning: `Rule matched keyword "${keyword}" in transaction description`,
          cleanedMerchant,
        };
      }
    }
  }

  // 3. Fallback heuristics based on amount sign / basic tags
  if (amount > 0 && normalizedDesc.includes("deposit")) {
    return {
      categoryName: "Income",
      type: "INCOME",
      isEssential: false,
      confidence: "MEDIUM",
      reasoning: "Heuristic: Positive amount with deposit indicator",
      cleanedMerchant,
    };
  }

  // Uncategorized / Miscellaneous fallback
  return {
    categoryName: "Shopping & Personal",
    type: "EXPENSE",
    isEssential: false,
    confidence: "FALLBACK",
    reasoning: "No keyword rule matched — assigned to general personal expenses",
    cleanedMerchant,
  };
}
