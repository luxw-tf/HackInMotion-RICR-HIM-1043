import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  {
    name: "Income",
    type: "INCOME",
    isEssential: false,
    color: "#059669",
    icon: "TrendingUp",
    keywords: ["salary", "payroll", "direct dep", "direct deposit", "paycheck", "wages", "dividend", "bonus", "freelance", "stripe payout", "upi credit", "refund", "infosys", "tcs", "wipro"],
  },
  {
    name: "Housing",
    type: "EXPENSE",
    isEssential: true,
    color: "#0284c7",
    icon: "Home",
    keywords: ["rent", "mortgage", "hoa", "property tax", "apartment", "landlord", "realty", "leasing", "prestige", "sobha", "maintenance fee"],
  },
  {
    name: "Food & Dining",
    type: "EXPENSE",
    isEssential: true,
    color: "#f59e0b",
    icon: "Utensils",
    keywords: ["grocery", "supermarket", "blinkit", "zepto", "swiggy", "zomato", "reliance fresh", "dmart", "nature basket", "restaurant", "cafe", "coffee", "starbucks", "mcdonald", "third wave", "burger king"],
  },
  {
    name: "Transportation",
    type: "EXPENSE",
    isEssential: true,
    color: "#6366f1",
    icon: "Car",
    keywords: ["fuel", "petrol", "diesel", "indian oil", "bharat pet", "shell", "hp fuel", "uber", "ola", "rapido", "metro", "fastag", "toll", "auto insurance", "hdfc ergo", "bajaj allianz"],
  },
  {
    name: "Utilities & Bills",
    type: "EXPENSE",
    isEssential: true,
    color: "#0d9488",
    icon: "Zap",
    keywords: ["electric", "power", "bescom", "tneb", "tatapower", "water utility", "gas co", "internet", "wifi", "airtel", "jio", "act fibernet", "vodafone", "trash"],
  },
  {
    name: "Healthcare",
    type: "EXPENSE",
    isEssential: true,
    color: "#e11d48",
    icon: "HeartPulse",
    keywords: ["pharmacy", "apollo", "medplus", "1mg", "practo", "hospital", "clinic", "medical", "dental", "dentist", "doctor", "health insurance", "care health"],
  },
  {
    name: "Entertainment & Leisure",
    type: "EXPENSE",
    isEssential: false,
    color: "#8b5cf6",
    icon: "Film",
    keywords: ["netflix", "spotify", "hotstar", "prime video", "bookmyshow", "pvr", "inox", "cinema", "movies", "steam", "playstation", "cult fit", "gym", "fitness", "concert"],
  },
  {
    name: "Shopping & Personal",
    type: "EXPENSE",
    isEssential: false,
    color: "#64748b",
    icon: "ShoppingBag",
    keywords: ["amazon", "flipkart", "myntra", "ajio", "zara", "h&m", "nike", "tata cliq", "nykaa", "salon", "urban company", "barber", "electronics", "croma"],
  },
  {
    name: "Savings & Investments",
    type: "SAVINGS",
    isEssential: false,
    color: "#10b981",
    icon: "PiggyBank",
    keywords: ["zerodha", "groww", "kuvera", "hdfc mutual", "sbi mutual", "icici direct", "ppf", "nps", "sip", "fixed deposit", "emergency fund", "hysa", "savings transfer", "investment"],
  },
];

const SAMPLE_TRANSACTIONS = [
  // Inflows (INR)
  { desc: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, type: "INCOME", cat: "Income", daysAgo: 1, accountName: "HDFC Salary Account", isRecurring: true, reason: "Rule matched keyword: salary" },
  { desc: "FREELANCE UI DESIGN CLIENT PAYOUT", amount: 24000.00, type: "INCOME", cat: "Income", daysAgo: 12, accountName: "HDFC Salary Account", reason: "Rule matched keyword: freelance" },
  { desc: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, type: "INCOME", cat: "Income", daysAgo: 31, accountName: "HDFC Salary Account", isRecurring: true, reason: "Rule matched keyword: salary" },
  { desc: "HDFC MUTUAL FUND DIVIDEND PAYOUT", amount: 3850.00, type: "INCOME", cat: "Income", daysAgo: 28, accountName: "Zerodha Investment A/C", reason: "Rule matched keyword: dividend" },
  { desc: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, type: "INCOME", cat: "Income", daysAgo: 61, accountName: "HDFC Salary Account", isRecurring: true, reason: "Rule matched keyword: salary" },

  // Housing
  { desc: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, type: "EXPENSE", cat: "Housing", daysAgo: 2, accountName: "HDFC Salary Account", isRecurring: true, reason: "Rule matched keyword: rent" },
  { desc: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, type: "EXPENSE", cat: "Housing", daysAgo: 32, accountName: "HDFC Salary Account", isRecurring: true, reason: "Rule matched keyword: rent" },
  { desc: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, type: "EXPENSE", cat: "Housing", daysAgo: 62, accountName: "HDFC Salary Account", isRecurring: true, reason: "Rule matched keyword: rent" },

  // Utilities
  { desc: "BESCOM ELECTRICITY BILL PAYMENT", amount: 2850.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 5, accountName: "ICICI Sapphiro Card", isRecurring: true, reason: "Rule matched keyword: bescom" },
  { desc: "AIRTEL FIBER BROADBAND HIGH SPEED INTERNET", amount: 1199.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 8, accountName: "ICICI Sapphiro Card", isRecurring: true, reason: "Rule matched keyword: airtel" },
  { desc: "JIO POSTPAID MOBILE FAMILY PLAN", amount: 999.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 10, accountName: "ICICI Sapphiro Card", isRecurring: true, reason: "Rule matched keyword: jio" },
  { desc: "BESCOM ELECTRICITY BILL PAYMENT", amount: 2640.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 35, accountName: "ICICI Sapphiro Card", isRecurring: true, reason: "Rule matched keyword: bescom" },
  { desc: "AIRTEL FIBER BROADBAND HIGH SPEED INTERNET", amount: 1199.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 38, accountName: "ICICI Sapphiro Card", isRecurring: true, reason: "Rule matched keyword: airtel" },

  // Food & Dining
  { desc: "BLINKIT GROCERIES EXPRESS DELIVERY", amount: 1450.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 3, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: blinkit" },
  { desc: "RELIANCE FRESH SUPERMARKET VEGETABLES", amount: 3280.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 7, accountName: "HDFC Salary Account", reason: "Rule matched keyword: reliance fresh" },
  { desc: "SWIGGY INSTAMART ESSENTIALS", amount: 890.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 14, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: swiggy" },
  { desc: "THIRD WAVE COFFEE CAFE", amount: 480.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 4, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: cafe" },
  { desc: "ZOMATO RESTAURANT DINING", amount: 1650.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 6, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: zomato" },
  { desc: "SWIGGY GOURMET FOOD DELIVERY", amount: 720.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 11, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: swiggy" },
  { desc: "NATURE BASKET ORGANIC SUPERMARKET", amount: 2850.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 18, accountName: "HDFC Salary Account", reason: "Rule matched keyword: supermarket" },
  { desc: "STARBUCKS COFFEE ROASTERS", amount: 560.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 22, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: starbucks" },

  // Transportation
  { desc: "INDIAN OIL PETROL FUEL PUMP", amount: 3500.00, type: "EXPENSE", cat: "Transportation", daysAgo: 4, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: fuel" },
  { desc: "UBER RIDE BANGALORE COMMUTE", amount: 420.00, type: "EXPENSE", cat: "Transportation", daysAgo: 9, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: uber" },
  { desc: "FASTAG TOLL PLAZA HIGHWAY", amount: 280.00, type: "EXPENSE", cat: "Transportation", daysAgo: 13, accountName: "HDFC Salary Account", reason: "Rule matched keyword: fastag" },
  { desc: "HDFC ERGO CAR INSURANCE PREMIUM", amount: 3800.00, type: "EXPENSE", cat: "Transportation", daysAgo: 16, accountName: "HDFC Salary Account", isRecurring: true, reason: "Rule matched keyword: auto insurance" },
  { desc: "SHELL PETROL FUEL PUMP", amount: 3200.00, type: "EXPENSE", cat: "Transportation", daysAgo: 25, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: fuel" },

  // Healthcare
  { desc: "APOLLO PHARMACY HEALTH MEDICINES", amount: 1450.00, type: "EXPENSE", cat: "Healthcare", daysAgo: 11, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: apollo" },
  { desc: "PRACTO DOCTOR CONSULTATION COPAY", amount: 800.00, type: "EXPENSE", cat: "Healthcare", daysAgo: 26, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: practo" },

  // Entertainment
  { desc: "NETFLIX INDIA MONTHLY 4K STREAMING", amount: 649.00, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 6, accountName: "ICICI Sapphiro Card", isRecurring: true, reason: "Rule matched keyword: netflix" },
  { desc: "SPOTIFY PREMIUM FAMILY PLAN", amount: 179.00, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 12, accountName: "ICICI Sapphiro Card", isRecurring: true, reason: "Rule matched keyword: spotify" },
  { desc: "CULT FIT GYM & FITNESS MEMBERSHIP", amount: 3200.00, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 22, accountName: "ICICI Sapphiro Card", isRecurring: true, reason: "Rule matched keyword: gym" },
  { desc: "BOOKMYSHOW PVR CINEMA MOVIE TICKETS", amount: 980.00, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 17, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: bookmyshow" },

  // Shopping
  { desc: "AMAZON INDIA RETAIL APPAREL ORDER", amount: 2890.00, type: "EXPENSE", cat: "Shopping & Personal", daysAgo: 7, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: amazon" },
  { desc: "MYNTRA FASHION CLOTHING", amount: 3450.00, type: "EXPENSE", cat: "Shopping & Personal", daysAgo: 19, accountName: "ICICI Sapphiro Card", reason: "Rule matched keyword: clothing" },

  // Savings
  { desc: "ZERODHA NIFTY 50 INDEX SIP AUTO-DEPOSIT", amount: 30000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 2, accountName: "Zerodha Investment A/C", isRecurring: true, reason: "Rule matched keyword: zerodha" },
  { desc: "HDFC HIGH YIELD EMERGENCY SAVINGS TRANSFER", amount: 15000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 15, accountName: "HDFC Salary Account", isRecurring: true, reason: "Rule matched keyword: emergency fund" },
  { desc: "ZERODHA NIFTY 50 INDEX SIP AUTO-DEPOSIT", amount: 30000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 32, accountName: "Zerodha Investment A/C", isRecurring: true, reason: "Rule matched keyword: zerodha" },
  { desc: "HDFC HIGH YIELD EMERGENCY SAVINGS TRANSFER", amount: 15000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 45, accountName: "HDFC Salary Account", isRecurring: true, reason: "Rule matched keyword: emergency fund" },
];

/**
 * Ensures demo user, categories, and initial data exist in the database.
 * Enables zero-setup demo mode on any fresh deployment.
 */
export async function bootstrapDemoUser() {
  const demoEmail = "demo@smartfinance.app";
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Seed or retrieve default categories
  const categoryRecordMap = new Map<string, string>();
  for (const cat of DEFAULT_CATEGORIES) {
    let existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null },
    });

    if (!existing) {
      existing = await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          isEssential: cat.isEssential,
          color: cat.color,
          icon: cat.icon,
        },
      });
    }

    categoryRecordMap.set(cat.name, existing.id);

    // Seed keywords if missing
    for (const kw of cat.keywords) {
      const kwExists = await prisma.categoryKeyword.findFirst({
        where: { categoryId: existing.id, keyword: kw.toLowerCase() },
      });
      if (!kwExists) {
        await prisma.categoryKeyword.create({
          data: {
            categoryId: existing.id,
            keyword: kw.toLowerCase(),
            priority: 1,
          },
        });
      }
    }
  }

  // 2. Find or create demo user
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        name: "Alex Rivera",
        email: demoEmail,
        password: hashedPassword,
      },
    });
  }

  // 3. Ensure accounts exist for demo user
  const existingAccounts = await prisma.financialAccount.findMany({
    where: { userId: demoUser.id },
  });

  const accountMap = new Map<string, string>();
  if (existingAccounts.length === 0) {
    const accountsToCreate = [
      { name: "HDFC Salary Account", type: "SAVINGS", institution: "HDFC Bank", accountNumberLast4: "4092", balance: 145000.00 },
      { name: "ICICI Sapphiro Card", type: "CREDIT_CARD", institution: "ICICI Bank", accountNumberLast4: "8821", balance: -24500.00 },
      { name: "Zerodha Investment A/C", type: "INVESTMENT", institution: "Zerodha Broking", accountNumberLast4: "9102", balance: 280000.00 },
    ];

    for (const acc of accountsToCreate) {
      const created = await prisma.financialAccount.create({
        data: {
          userId: demoUser.id,
          name: acc.name,
          type: acc.type,
          institution: acc.institution,
          accountNumberLast4: acc.accountNumberLast4,
          balance: acc.balance,
          currency: "INR",
        },
      });
      accountMap.set(acc.name, created.id);
    }
  } else {
    existingAccounts.forEach((a) => accountMap.set(a.name, a.id));
  }

  // 4. Seed transactions if empty
  const txCount = await prisma.transaction.count({
    where: { userId: demoUser.id },
  });

  if (txCount === 0) {
    const now = new Date();
    for (const item of SAMPLE_TRANSACTIONS) {
      const txDate = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000);
      const catId = categoryRecordMap.get(item.cat) || null;
      const accId = accountMap.get(item.accountName) || null;

      await prisma.transaction.create({
        data: {
          userId: demoUser.id,
          accountId: accId,
          categoryId: catId,
          amount: item.amount,
          type: item.type,
          date: txDate,
          description: item.desc,
          merchant: item.desc.split(" ")[0],
          source: "DEMO_SEED",
          isRecurring: item.isRecurring || false,
          reasoning: item.reason,
        },
      });
    }

    // Add savings goals
    await prisma.savingsGoal.createMany({
      data: [
        {
          userId: demoUser.id,
          name: "6-Month Emergency Cushion",
          targetAmount: 300000.00,
          currentAmount: 195000.00,
          categoryType: "EMERGENCY_FUND",
          status: "ACTIVE",
          targetDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
        },
        {
          userId: demoUser.id,
          name: "Annual PPF / Mutual Fund Milestone",
          targetAmount: 150000.00,
          currentAmount: 90000.00,
          categoryType: "RETIREMENT",
          status: "ACTIVE",
          targetDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    // Add sample budgets
    const foodCatId = categoryRecordMap.get("Food & Dining");
    const entCatId = categoryRecordMap.get("Entertainment & Leisure");

    if (foodCatId) {
      await prisma.budget.create({
        data: {
          userId: demoUser.id,
          categoryId: foodCatId,
          amount: 18000.00,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      });
    }

    if (entCatId) {
      await prisma.budget.create({
        data: {
          userId: demoUser.id,
          categoryId: entCatId,
          amount: 8000.00,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
      });
    }
  }

  return demoUser;
}
