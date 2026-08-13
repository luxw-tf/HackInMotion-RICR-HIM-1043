import { DEFAULT_CATEGORY_TAXONOMY, cleanMerchantName } from "./categorization/rules";

export const DEMO_USER = {
  id: "demo-user-1043",
  name: "Alex Rivera",
  email: "demo@smartfinance.app",
  password: "password123", // Will be hashed with bcrypt
};

export interface SeedTransaction {
  description: string;
  amount: number;
  type: "EXPENSE" | "INCOME" | "SAVINGS";
  categoryName: string;
  daysAgo: number;
  isRecurring?: boolean;
  notes?: string;
}

export const SAMPLE_TRANSACTIONS: SeedTransaction[] = [
  // --- Inflows / Salary (Semi-monthly) ---
  { description: "ACME TECH CORP DIRECT DEPOSIT PAYROLL", amount: 3400.00, type: "INCOME", categoryName: "Income", daysAgo: 1, isRecurring: true },
  { description: "ACME TECH CORP DIRECT DEPOSIT PAYROLL", amount: 3400.00, type: "INCOME", categoryName: "Income", daysAgo: 15, isRecurring: true },
  { description: "ACME TECH CORP DIRECT DEPOSIT PAYROLL", amount: 3400.00, type: "INCOME", categoryName: "Income", daysAgo: 31, isRecurring: true },
  { description: "ACME TECH CORP DIRECT DEPOSIT PAYROLL", amount: 3400.00, type: "INCOME", categoryName: "Income", daysAgo: 45, isRecurring: true },
  { description: "ACME TECH CORP DIRECT DEPOSIT PAYROLL", amount: 3400.00, type: "INCOME", categoryName: "Income", daysAgo: 61, isRecurring: true },
  { description: "STRIPE PAYOUT FREELANCE DESIGN INVOICE #108", amount: 650.00, type: "INCOME", categoryName: "Income", daysAgo: 12 },
  { description: "DIVIDEND REINVESTMENT VANGUARD VTSAX", amount: 48.50, type: "INCOME", categoryName: "Income", daysAgo: 28 },

  // --- Housing & Essentials ---
  { description: "AVALON BAY APARTMENTS MONTHLY RENT", amount: 1950.00, type: "EXPENSE", categoryName: "Housing", daysAgo: 2, isRecurring: true },
  { description: "AVALON BAY APARTMENTS MONTHLY RENT", amount: 1950.00, type: "EXPENSE", categoryName: "Housing", daysAgo: 32, isRecurring: true },
  { description: "AVALON BAY APARTMENTS MONTHLY RENT", amount: 1950.00, type: "EXPENSE", categoryName: "Housing", daysAgo: 62, isRecurring: true },
  
  // --- Utilities & Bills ---
  { description: "PACIFIC GAS & ELECTRIC UTILITY CO", amount: 112.40, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 5, isRecurring: true },
  { description: "COMCAST XFINITY HIGH SPEED INTERNET", amount: 79.99, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 8, isRecurring: true },
  { description: "VERIZON WIRELESS MONTHLY PLAN", amount: 85.00, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 10, isRecurring: true },
  { description: "PACIFIC GAS & ELECTRIC UTILITY CO", amount: 108.15, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 35, isRecurring: true },
  { description: "COMCAST XFINITY HIGH SPEED INTERNET", amount: 79.99, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 38, isRecurring: true },
  { description: "VERIZON WIRELESS MONTHLY PLAN", amount: 85.00, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 40, isRecurring: true },

  // --- Groceries & Food ---
  { description: "TRADER JOE'S #104 GROCERY STORE", amount: 94.30, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 3 },
  { description: "WHOLE FOODS MARKET ORGANIC PRODUCE", amount: 128.45, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 7 },
  { description: "SAFEWAY STORE #3829 GROCERY", amount: 64.20, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 14 },
  { description: "BLUE BOTTLE COFFEE CAFE", amount: 6.75, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 4 },
  { description: "CHIPOTLE MEXICAN GRILL #84", amount: 16.40, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 6 },
  { description: "DOORDASH RESTAURANT DELIVERY", amount: 42.80, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 11 },
  { description: "TRADER JOE'S #104 GROCERY STORE", amount: 110.15, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 18 },
  { description: "WHOLE FOODS MARKET", amount: 89.60, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 24 },
  { description: "STARBUCKS COFFEE STORE #9182", amount: 7.25, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 22 },
  { description: "TRADER JOE'S #104 GROCERY STORE", amount: 85.50, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 34 },
  { description: "SAFEWAY GROCERY STORE", amount: 92.10, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 41 },

  // --- Transportation ---
  { description: "CHEVRON GAS STATION FUEL PUMP #4", amount: 54.20, type: "EXPENSE", categoryName: "Transportation", daysAgo: 4 },
  { description: "UBER TRIP RIDERS SAN FRANCISCO", amount: 24.80, type: "EXPENSE", categoryName: "Transportation", daysAgo: 9 },
  { description: "BAY AREA FASTRAK BRIDGE TOLL", amount: 7.00, type: "EXPENSE", categoryName: "Transportation", daysAgo: 13 },
  { description: "GEICO AUTO INSURANCE PREMIUM", amount: 135.00, type: "EXPENSE", categoryName: "Transportation", daysAgo: 16, isRecurring: true },
  { description: "CHEVRON GAS STATION FUEL", amount: 51.90, type: "EXPENSE", categoryName: "Transportation", daysAgo: 25 },
  { description: "GEICO AUTO INSURANCE PREMIUM", amount: 135.00, type: "EXPENSE", categoryName: "Transportation", daysAgo: 46, isRecurring: true },

  // --- Healthcare ---
  { description: "CVS PHARMACY PRESCRIPTION REFILL", amount: 28.50, type: "EXPENSE", categoryName: "Healthcare", daysAgo: 11 },
  { description: "ONE MEDICAL ANNUAL MEMBERSHIP / COPAY", amount: 35.00, type: "EXPENSE", categoryName: "Healthcare", daysAgo: 26 },
  { description: "WALGREENS PHARMACY HEALTH SUPPLIES", amount: 19.80, type: "EXPENSE", categoryName: "Healthcare", daysAgo: 44 },

  // --- Entertainment & Subscriptions ---
  { description: "NETFLIX.COM MONTHLY 4K STREAMING", amount: 22.99, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 6, isRecurring: true },
  { description: "SPOTIFY PREMIUM FAMILY PLAN", amount: 16.99, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 12, isRecurring: true },
  { description: "AMC THEATRES CINEMA TICKETS", amount: 38.50, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 17 },
  { description: "STEAM GAMES PURCHASE DIGITAL", amount: 29.99, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 20 },
  { description: "EQUINOX FITNESS GYM MONTHLY", amount: 180.00, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 22, isRecurring: true },
  { description: "NETFLIX.COM MONTHLY 4K STREAMING", amount: 22.99, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 36, isRecurring: true },
  { description: "SPOTIFY PREMIUM FAMILY PLAN", amount: 16.99, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 42, isRecurring: true },
  { description: "EQUINOX FITNESS GYM MONTHLY", amount: 180.00, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 52, isRecurring: true },

  // --- Shopping & Personal ---
  { description: "AMAZON.COM*RETAIL ORDER #402", amount: 62.40, type: "EXPENSE", categoryName: "Shopping & Personal", daysAgo: 7 },
  { description: "UNIQLO APPAREL CLOTHING STORE", amount: 89.00, type: "EXPENSE", categoryName: "Shopping & Personal", daysAgo: 19 },
  { description: "AMAZON.COM*HOME GOODS PRIME", amount: 45.20, type: "EXPENSE", categoryName: "Shopping & Personal", daysAgo: 33 },

  // --- Savings & Wealth Building ---
  { description: "VANGUARD INDEX FUND AUTO-DEPOSIT", amount: 1000.00, type: "SAVINGS", categoryName: "Savings & Investments", daysAgo: 2, isRecurring: true },
  { description: "HIGH YIELD SAVINGS EMERGENCY FUND TRANSFER", amount: 500.00, type: "SAVINGS", categoryName: "Savings & Investments", daysAgo: 15, isRecurring: true },
  { description: "VANGUARD INDEX FUND AUTO-DEPOSIT", amount: 1000.00, type: "SAVINGS", categoryName: "Savings & Investments", daysAgo: 32, isRecurring: true },
  { description: "HIGH YIELD SAVINGS EMERGENCY FUND TRANSFER", amount: 500.00, type: "SAVINGS", categoryName: "Savings & Investments", daysAgo: 45, isRecurring: true },
];
