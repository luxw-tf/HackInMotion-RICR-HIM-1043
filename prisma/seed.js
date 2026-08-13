const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  {
    name: "Income",
    type: "INCOME",
    isEssential: false,
    color: "#059669",
    icon: "TrendingUp",
    keywords: ["salary", "payroll", "direct dep", "direct deposit", "paycheck", "wages", "dividend", "bonus", "freelance", "stripe payout", "venmo cashout", "refund"],
  },
  {
    name: "Housing",
    type: "EXPENSE",
    isEssential: true,
    color: "#0284c7",
    icon: "Home",
    keywords: ["rent", "mortgage", "hoa", "property tax", "apartment", "landlord", "realty", "leasing", "maintenance fee"],
  },
  {
    name: "Food & Dining",
    type: "EXPENSE",
    isEssential: true,
    color: "#f59e0b",
    icon: "Utensils",
    keywords: ["grocery", "supermarket", "trader joe", "whole foods", "safeway", "kroger", "costco", "walmart", "restaurant", "cafe", "coffee", "starbucks", "mcdonald", "doordash", "ubereats", "chipotle"],
  },
  {
    name: "Transportation",
    type: "EXPENSE",
    isEssential: true,
    color: "#6366f1",
    icon: "Car",
    keywords: ["gas", "fuel", "chevron", "shell", "exxon", "uber", "lyft", "transit", "metro", "subway", "train", "parking", "toll", "auto insurance", "geico"],
  },
  {
    name: "Utilities & Bills",
    type: "EXPENSE",
    isEssential: true,
    color: "#0d9488",
    icon: "Zap",
    keywords: ["electric", "power", "energy", "pge", "water utility", "gas co", "internet", "wifi", "comcast", "xfinity", "verizon", "at&t", "t-mobile", "trash"],
  },
  {
    name: "Healthcare",
    type: "EXPENSE",
    isEssential: true,
    color: "#e11d48",
    icon: "HeartPulse",
    keywords: ["pharmacy", "cvs", "walgreens", "hospital", "clinic", "medical", "dental", "dentist", "doctor", "health insurance", "optometry"],
  },
  {
    name: "Entertainment & Leisure",
    type: "EXPENSE",
    isEssential: false,
    color: "#8b5cf6",
    icon: "Film",
    keywords: ["netflix", "spotify", "apple music", "hulu", "disney", "hbo", "cinema", "amc", "movies", "steam", "playstation", "xbox", "gym", "fitness", "equinox", "concert"],
  },
  {
    name: "Shopping & Personal",
    type: "EXPENSE",
    isEssential: false,
    color: "#64748b",
    icon: "ShoppingBag",
    keywords: ["amazon", "amzn", "clothing", "apparel", "zara", "nike", "apple store", "best buy", "electronics", "salon", "barber", "target", "ikea"],
  },
  {
    name: "Savings & Investments",
    type: "SAVINGS",
    isEssential: false,
    color: "#10b981",
    icon: "PiggyBank",
    keywords: ["vanguard", "fidelity", "schwab", "robinhood", "401k", "ira contribution", "savings transfer", "hysa", "emergency fund", "investment"],
  },
];

const SAMPLE_TRANSACTIONS = [
  // Inflows
  { desc: "ACME TECH CORP DIRECT DEPOSIT PAYROLL", amount: 3400.00, type: "INCOME", cat: "Income", daysAgo: 1, isRecurring: true, reason: "Rule matched keyword: payroll" },
  { desc: "ACME TECH CORP DIRECT DEPOSIT PAYROLL", amount: 3400.00, type: "INCOME", cat: "Income", daysAgo: 15, isRecurring: true, reason: "Rule matched keyword: payroll" },
  { desc: "ACME TECH CORP DIRECT DEPOSIT PAYROLL", amount: 3400.00, type: "INCOME", cat: "Income", daysAgo: 31, isRecurring: true, reason: "Rule matched keyword: payroll" },
  { desc: "ACME TECH CORP DIRECT DEPOSIT PAYROLL", amount: 3400.00, type: "INCOME", cat: "Income", daysAgo: 45, isRecurring: true, reason: "Rule matched keyword: payroll" },
  { desc: "STRIPE PAYOUT FREELANCE DESIGN INVOICE #108", amount: 650.00, type: "INCOME", cat: "Income", daysAgo: 12, reason: "Rule matched keyword: freelance" },
  { desc: "DIVIDEND REINVESTMENT VANGUARD VTSAX", amount: 48.50, type: "INCOME", cat: "Income", daysAgo: 28, reason: "Rule matched keyword: dividend" },

  // Housing
  { desc: "AVALON BAY APARTMENTS MONTHLY RENT", amount: 1950.00, type: "EXPENSE", cat: "Housing", daysAgo: 2, isRecurring: true, reason: "Rule matched keyword: rent" },
  { desc: "AVALON BAY APARTMENTS MONTHLY RENT", amount: 1950.00, type: "EXPENSE", cat: "Housing", daysAgo: 32, isRecurring: true, reason: "Rule matched keyword: rent" },
  { desc: "AVALON BAY APARTMENTS MONTHLY RENT", amount: 1950.00, type: "EXPENSE", cat: "Housing", daysAgo: 62, isRecurring: true, reason: "Rule matched keyword: rent" },

  // Utilities
  { desc: "PACIFIC GAS & ELECTRIC UTILITY CO", amount: 112.40, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 5, isRecurring: true, reason: "Rule matched keyword: electric" },
  { desc: "COMCAST XFINITY HIGH SPEED INTERNET", amount: 79.99, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 8, isRecurring: true, reason: "Rule matched keyword: internet" },
  { desc: "VERIZON WIRELESS MONTHLY PLAN", amount: 85.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 10, isRecurring: true, reason: "Rule matched keyword: verizon" },
  { desc: "PACIFIC GAS & ELECTRIC UTILITY CO", amount: 108.15, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 35, isRecurring: true, reason: "Rule matched keyword: electric" },
  { desc: "COMCAST XFINITY HIGH SPEED INTERNET", amount: 79.99, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 38, isRecurring: true, reason: "Rule matched keyword: internet" },
  { desc: "VERIZON WIRELESS MONTHLY PLAN", amount: 85.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 40, isRecurring: true, reason: "Rule matched keyword: verizon" },

  // Groceries & Food
  { desc: "TRADER JOE'S #104 GROCERY STORE", amount: 94.30, type: "EXPENSE", cat: "Food & Dining", daysAgo: 3, reason: "Rule matched keyword: trader joe" },
  { desc: "WHOLE FOODS MARKET ORGANIC PRODUCE", amount: 128.45, type: "EXPENSE", cat: "Food & Dining", daysAgo: 7, reason: "Rule matched keyword: whole foods" },
  { desc: "SAFEWAY STORE #3829 GROCERY", amount: 64.20, type: "EXPENSE", cat: "Food & Dining", daysAgo: 14, reason: "Rule matched keyword: safeway" },
  { desc: "BLUE BOTTLE COFFEE CAFE", amount: 6.75, type: "EXPENSE", cat: "Food & Dining", daysAgo: 4, reason: "Rule matched keyword: cafe" },
  { desc: "CHIPOTLE MEXICAN GRILL #84", amount: 16.40, type: "EXPENSE", cat: "Food & Dining", daysAgo: 6, reason: "Rule matched keyword: chipotle" },
  { desc: "DOORDASH RESTAURANT DELIVERY", amount: 42.80, type: "EXPENSE", cat: "Food & Dining", daysAgo: 11, reason: "Rule matched keyword: doordash" },
  { desc: "TRADER JOE'S #104 GROCERY STORE", amount: 110.15, type: "EXPENSE", cat: "Food & Dining", daysAgo: 18, reason: "Rule matched keyword: trader joe" },
  { desc: "WHOLE FOODS MARKET", amount: 89.60, type: "EXPENSE", cat: "Food & Dining", daysAgo: 24, reason: "Rule matched keyword: whole foods" },

  // Transportation
  { desc: "CHEVRON GAS STATION FUEL PUMP #4", amount: 54.20, type: "EXPENSE", cat: "Transportation", daysAgo: 4, reason: "Rule matched keyword: gas" },
  { desc: "UBER TRIP RIDERS SAN FRANCISCO", amount: 24.80, type: "EXPENSE", cat: "Transportation", daysAgo: 9, reason: "Rule matched keyword: uber" },
  { desc: "BAY AREA FASTRAK BRIDGE TOLL", amount: 7.00, type: "EXPENSE", cat: "Transportation", daysAgo: 13, reason: "Rule matched keyword: toll" },
  { desc: "GEICO AUTO INSURANCE PREMIUM", amount: 135.00, type: "EXPENSE", cat: "Transportation", daysAgo: 16, isRecurring: true, reason: "Rule matched keyword: auto insurance" },

  // Healthcare
  { desc: "CVS PHARMACY PRESCRIPTION REFILL", amount: 28.50, type: "EXPENSE", cat: "Healthcare", daysAgo: 11, reason: "Rule matched keyword: cvs" },
  { desc: "ONE MEDICAL ANNUAL MEMBERSHIP / COPAY", amount: 35.00, type: "EXPENSE", cat: "Healthcare", daysAgo: 26, reason: "Rule matched keyword: medical" },

  // Entertainment
  { desc: "NETFLIX.COM MONTHLY 4K STREAMING", amount: 22.99, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 6, isRecurring: true, reason: "Rule matched keyword: netflix" },
  { desc: "SPOTIFY PREMIUM FAMILY PLAN", amount: 16.99, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 12, isRecurring: true, reason: "Rule matched keyword: spotify" },
  { desc: "EQUINOX FITNESS GYM MONTHLY", amount: 180.00, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 22, isRecurring: true, reason: "Rule matched keyword: gym" },

  // Shopping
  { desc: "AMAZON.COM*RETAIL ORDER #402", amount: 62.40, type: "EXPENSE", cat: "Shopping & Personal", daysAgo: 7, reason: "Rule matched keyword: amazon" },
  { desc: "UNIQLO APPAREL CLOTHING STORE", amount: 89.00, type: "EXPENSE", cat: "Shopping & Personal", daysAgo: 19, reason: "Rule matched keyword: clothing" },

  // Savings
  { desc: "VANGUARD INDEX FUND AUTO-DEPOSIT", amount: 1000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 2, isRecurring: true, reason: "Rule matched keyword: vanguard" },
  { desc: "HIGH YIELD SAVINGS EMERGENCY FUND TRANSFER", amount: 500.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 15, isRecurring: true, reason: "Rule matched keyword: emergency fund" },
  { desc: "VANGUARD INDEX FUND AUTO-DEPOSIT", amount: 1000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 32, isRecurring: true, reason: "Rule matched keyword: vanguard" },
  { desc: "HIGH YIELD SAVINGS EMERGENCY FUND TRANSFER", amount: 500.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 45, isRecurring: true, reason: "Rule matched keyword: emergency fund" },
];

async function seed() {
  console.log("🌱 Seeding database...");

  // 1. Create Default Categories & Keywords
  const categoryRecordMap = new Map();

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
      console.log(`Created default category: ${cat.name}`);
    }

    categoryRecordMap.set(cat.name, existing);

    // Seed keywords
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

  // 2. Create Demo User
  const demoEmail = "demo@smartfinance.app";
  let demoUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  const hashedPassword = await bcrypt.hash("password123", 10);

  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        id: "demo-user-1043",
        name: "Alex Rivera",
        email: demoEmail,
        password: hashedPassword,
      },
    });
    console.log("Created demo user: demo@smartfinance.app / password123");
  }

  // 3. Clear and re-populate demo transactions
  await prisma.transaction.deleteMany({
    where: { userId: demoUser.id },
  });

  const now = new Date();

  for (const item of SAMPLE_TRANSACTIONS) {
    const txDate = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000);
    const catRecord = categoryRecordMap.get(item.cat);

    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        categoryId: catRecord ? catRecord.id : null,
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

  // 4. Create demo financial goals
  await prisma.financialGoal.deleteMany({
    where: { userId: demoUser.id },
  });

  await prisma.financialGoal.createMany({
    data: [
      {
        userId: demoUser.id,
        name: "6-Month Emergency Cushion",
        targetAmount: 15000.00,
        currentAmount: 9500.00,
        categoryType: "EMERGENCY_FUND",
        status: "ACTIVE",
        targetDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
      },
      {
        userId: demoUser.id,
        name: "Roth IRA Annual Max",
        targetAmount: 7000.00,
        currentAmount: 4000.00,
        categoryType: "RETIREMENT",
        status: "ACTIVE",
        targetDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 5. Create demo budgets
  await prisma.budget.deleteMany({
    where: { userId: demoUser.id },
  });

  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const foodCat = categoryRecordMap.get("Food & Dining");
  const entertainmentCat = categoryRecordMap.get("Entertainment & Leisure");

  if (foodCat) {
    await prisma.budget.create({
      data: {
        userId: demoUser.id,
        categoryId: foodCat.id,
        amount: 650.00,
        month: currentMonth,
        year: currentYear,
      },
    });
  }

  if (entertainmentCat) {
    await prisma.budget.create({
      data: {
        userId: demoUser.id,
        categoryId: entertainmentCat.id,
        amount: 300.00,
        month: currentMonth,
        year: currentYear,
      },
    });
  }

  console.log("✅ Seed completed successfully!");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
