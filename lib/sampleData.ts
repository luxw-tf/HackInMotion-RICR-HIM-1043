import { DEFAULT_CATEGORY_TAXONOMY, cleanMerchantName } from "./categorization/rules";

export const DEMO_USER = {
  id: "demo-user-1043",
  name: "Alex Rivera",
  email: "demo@smartfinance.app",
  password: "password123", // Hashed with bcrypt
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
  // --- Inflows / Salary (Monthly / Bi-weekly) ---
  { description: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, type: "INCOME", categoryName: "Income", daysAgo: 1, isRecurring: true },
  { description: "FREELANCE UI DESIGN CLIENT PAYOUT", amount: 24000.00, type: "INCOME", categoryName: "Income", daysAgo: 12 },
  { description: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, type: "INCOME", categoryName: "Income", daysAgo: 31, isRecurring: true },
  { description: "HDFC MUTUAL FUND DIVIDEND PAYOUT", amount: 3850.00, type: "INCOME", categoryName: "Income", daysAgo: 28 },
  { description: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, type: "INCOME", categoryName: "Income", daysAgo: 61, isRecurring: true },

  // --- Housing & Rent ---
  { description: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, type: "EXPENSE", categoryName: "Housing", daysAgo: 2, isRecurring: true },
  { description: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, type: "EXPENSE", categoryName: "Housing", daysAgo: 32, isRecurring: true },
  { description: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, type: "EXPENSE", categoryName: "Housing", daysAgo: 62, isRecurring: true },
  
  // --- Utilities & Bills ---
  { description: "BESCOM ELECTRICITY BILL PAYMENT", amount: 2850.00, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 5, isRecurring: true },
  { description: "AIRTEL FIBER BROADBAND HIGH SPEED INTERNET", amount: 1199.00, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 8, isRecurring: true },
  { description: "JIO POSTPAID MOBILE FAMILY PLAN", amount: 999.00, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 10, isRecurring: true },
  { description: "BESCOM ELECTRICITY BILL PAYMENT", amount: 2640.00, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 35, isRecurring: true },
  { description: "AIRTEL FIBER BROADBAND HIGH SPEED INTERNET", amount: 1199.00, type: "EXPENSE", categoryName: "Utilities & Bills", daysAgo: 38, isRecurring: true },

  // --- Groceries & Food ---
  { description: "BLINKIT GROCERIES EXPRESS DELIVERY", amount: 1450.00, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 3 },
  { description: "RELIANCE FRESH SUPERMARKET VEGETABLES", amount: 3280.00, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 7 },
  { description: "SWIGGY INSTAMART ESSENTIALS", amount: 890.00, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 14 },
  { description: "THIRD WAVE COFFEE CAFE", amount: 480.00, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 4 },
  { description: "ZOMATO RESTAURANT DINING", amount: 1650.00, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 6 },
  { description: "SWIGGO GOURMET FOOD DELIVERY", amount: 720.00, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 11 },
  { description: "NATURE BASKET ORGANIC SUPERMARKET", amount: 2850.00, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 18 },
  { description: "STARBUCKS COFFEE ROASTERS", amount: 560.00, type: "EXPENSE", categoryName: "Food & Dining", daysAgo: 22 },

  // --- Transportation ---
  { description: "INDIAN OIL PETROL FUEL PUMP", amount: 3500.00, type: "EXPENSE", categoryName: "Transportation", daysAgo: 4 },
  { description: "UBER RIDE BANGALORE COMMUTE", amount: 420.00, type: "EXPENSE", categoryName: "Transportation", daysAgo: 9 },
  { description: "FASTAG TOLL PLAZA HIGHWAY", amount: 280.00, type: "EXPENSE", categoryName: "Transportation", daysAgo: 13 },
  { description: "HDFC ERGO CAR INSURANCE PREMIUM", amount: 3800.00, type: "EXPENSE", categoryName: "Transportation", daysAgo: 16, isRecurring: true },
  { description: "SHELL PETROL FUEL PUMP", amount: 3200.00, type: "EXPENSE", categoryName: "Transportation", daysAgo: 25 },

  // --- Healthcare ---
  { description: "APOLLO PHARMACY HEALTH MEDICINES", amount: 1450.00, type: "EXPENSE", categoryName: "Healthcare", daysAgo: 11 },
  { description: "PRACTO DOCTOR CONSULTATION COPAY", amount: 800.00, type: "EXPENSE", categoryName: "Healthcare", daysAgo: 26 },

  // --- Entertainment & Subscriptions ---
  { description: "NETFLIX INDIA MONTHLY 4K STREAMING", amount: 649.00, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 6, isRecurring: true },
  { description: "SPOTIFY PREMIUM FAMILY PLAN", amount: 179.00, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 12, isRecurring: true },
  { description: "CULT FIT GYM & FITNESS MEMBERSHIP", amount: 3200.00, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 22, isRecurring: true },
  { description: "BOOKMYSHOW PVR CINEMA MOVIE TICKETS", amount: 980.00, type: "EXPENSE", categoryName: "Entertainment & Leisure", daysAgo: 17 },

  // --- Shopping & Personal ---
  { description: "AMAZON INDIA RETAIL APPAREL ORDER", amount: 2890.00, type: "EXPENSE", categoryName: "Shopping & Personal", daysAgo: 7 },
  { description: "MYNTRA FASHION CLOTHING", amount: 3450.00, type: "EXPENSE", categoryName: "Shopping & Personal", daysAgo: 19 },

  // --- Savings & Wealth Building ---
  { description: "ZERODHA NIFTY 50 INDEX SIP AUTO-DEPOSIT", amount: 30000.00, type: "SAVINGS", categoryName: "Savings & Investments", daysAgo: 2, isRecurring: true },
  { description: "HDFC HIGH YIELD EMERGENCY SAVINGS TRANSFER", amount: 15000.00, type: "SAVINGS", categoryName: "Savings & Investments", daysAgo: 15, isRecurring: true },
  { description: "ZERODHA NIFTY 50 INDEX SIP AUTO-DEPOSIT", amount: 30000.00, type: "SAVINGS", categoryName: "Savings & Investments", daysAgo: 32, isRecurring: true },
  { description: "HDFC HIGH YIELD EMERGENCY SAVINGS TRANSFER", amount: 15000.00, type: "SAVINGS", categoryName: "Savings & Investments", daysAgo: 45, isRecurring: true },
];
