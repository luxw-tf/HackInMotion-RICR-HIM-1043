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
  { desc: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, type: "INCOME", cat: "Income", daysAgo: 1, isRecurring: true, reason: "Rule matched keyword: salary" },
  { desc: "FREELANCE UI DESIGN CLIENT PAYOUT", amount: 24000.00, type: "INCOME", cat: "Income", daysAgo: 12, reason: "Rule matched keyword: freelance" },
  { desc: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, type: "INCOME", cat: "Income", daysAgo: 31, isRecurring: true, reason: "Rule matched keyword: salary" },
  { desc: "HDFC MUTUAL FUND DIVIDEND PAYOUT", amount: 3850.00, type: "INCOME", cat: "Income", daysAgo: 28, reason: "Rule matched keyword: dividend" },
  { desc: "INFOSYS TECH CORP DIRECT SALARY CREDIT", amount: 125000.00, type: "INCOME", cat: "Income", daysAgo: 61, isRecurring: true, reason: "Rule matched keyword: salary" },

  // Housing
  { desc: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, type: "EXPENSE", cat: "Housing", daysAgo: 2, isRecurring: true, reason: "Rule matched keyword: rent" },
  { desc: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, type: "EXPENSE", cat: "Housing", daysAgo: 32, isRecurring: true, reason: "Rule matched keyword: rent" },
  { desc: "PRESTIGE APARTMENTS MONTHLY RENT TRANSFER", amount: 32000.00, type: "EXPENSE", cat: "Housing", daysAgo: 62, isRecurring: true, reason: "Rule matched keyword: rent" },

  // Utilities
  { desc: "BESCOM ELECTRICITY BILL PAYMENT", amount: 2850.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 5, isRecurring: true, reason: "Rule matched keyword: bescom" },
  { desc: "AIRTEL FIBER BROADBAND HIGH SPEED INTERNET", amount: 1199.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 8, isRecurring: true, reason: "Rule matched keyword: airtel" },
  { desc: "JIO POSTPAID MOBILE FAMILY PLAN", amount: 999.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 10, isRecurring: true, reason: "Rule matched keyword: jio" },
  { desc: "BESCOM ELECTRICITY BILL PAYMENT", amount: 2640.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 35, isRecurring: true, reason: "Rule matched keyword: bescom" },
  { desc: "AIRTEL FIBER BROADBAND HIGH SPEED INTERNET", amount: 1199.00, type: "EXPENSE", cat: "Utilities & Bills", daysAgo: 38, isRecurring: true, reason: "Rule matched keyword: airtel" },

  // Food & Dining
  { desc: "BLINKIT GROCERIES EXPRESS DELIVERY", amount: 1450.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 3, reason: "Rule matched keyword: blinkit" },
  { desc: "RELIANCE FRESH SUPERMARKET VEGETABLES", amount: 3280.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 7, reason: "Rule matched keyword: reliance fresh" },
  { desc: "SWIGGY INSTAMART ESSENTIALS", amount: 890.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 14, reason: "Rule matched keyword: swiggy" },
  { desc: "THIRD WAVE COFFEE CAFE", amount: 480.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 4, reason: "Rule matched keyword: cafe" },
  { desc: "ZOMATO RESTAURANT DINING", amount: 1650.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 6, reason: "Rule matched keyword: zomato" },
  { desc: "SWIGGY GOURMET FOOD DELIVERY", amount: 720.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 11, reason: "Rule matched keyword: swiggy" },
  { desc: "NATURE BASKET ORGANIC SUPERMARKET", amount: 2850.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 18, reason: "Rule matched keyword: supermarket" },
  { desc: "STARBUCKS COFFEE ROASTERS", amount: 560.00, type: "EXPENSE", cat: "Food & Dining", daysAgo: 22, reason: "Rule matched keyword: starbucks" },

  // Transportation
  { desc: "INDIAN OIL PETROL FUEL PUMP", amount: 3500.00, type: "EXPENSE", cat: "Transportation", daysAgo: 4, reason: "Rule matched keyword: fuel" },
  { desc: "UBER RIDE BANGALORE COMMUTE", amount: 420.00, type: "EXPENSE", cat: "Transportation", daysAgo: 9, reason: "Rule matched keyword: uber" },
  { desc: "FASTAG TOLL PLAZA HIGHWAY", amount: 280.00, type: "EXPENSE", cat: "Transportation", daysAgo: 13, reason: "Rule matched keyword: fastag" },
  { desc: "HDFC ERGO CAR INSURANCE PREMIUM", amount: 3800.00, type: "EXPENSE", cat: "Transportation", daysAgo: 16, isRecurring: true, reason: "Rule matched keyword: auto insurance" },
  { desc: "SHELL PETROL FUEL PUMP", amount: 3200.00, type: "EXPENSE", cat: "Transportation", daysAgo: 25, reason: "Rule matched keyword: fuel" },

  // Healthcare
  { desc: "APOLLO PHARMACY HEALTH MEDICINES", amount: 1450.00, type: "EXPENSE", cat: "Healthcare", daysAgo: 11, reason: "Rule matched keyword: apollo" },
  { desc: "PRACTO DOCTOR CONSULTATION COPAY", amount: 800.00, type: "EXPENSE", cat: "Healthcare", daysAgo: 26, reason: "Rule matched keyword: practo" },

  // Entertainment
  { desc: "NETFLIX INDIA MONTHLY 4K STREAMING", amount: 649.00, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 6, isRecurring: true, reason: "Rule matched keyword: netflix" },
  { desc: "SPOTIFY PREMIUM FAMILY PLAN", amount: 179.00, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 12, isRecurring: true, reason: "Rule matched keyword: spotify" },
  { desc: "CULT FIT GYM & FITNESS MEMBERSHIP", amount: 3200.00, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 22, isRecurring: true, reason: "Rule matched keyword: gym" },
  { desc: "BOOKMYSHOW PVR CINEMA MOVIE TICKETS", amount: 980.00, type: "EXPENSE", cat: "Entertainment & Leisure", daysAgo: 17, reason: "Rule matched keyword: bookmyshow" },

  // Shopping
  { desc: "AMAZON INDIA RETAIL APPAREL ORDER", amount: 2890.00, type: "EXPENSE", cat: "Shopping & Personal", daysAgo: 7, reason: "Rule matched keyword: amazon" },
  { desc: "MYNTRA FASHION CLOTHING", amount: 3450.00, type: "EXPENSE", cat: "Shopping & Personal", daysAgo: 19, reason: "Rule matched keyword: clothing" },

  // Savings
  { desc: "ZERODHA NIFTY 50 INDEX SIP AUTO-DEPOSIT", amount: 30000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 2, isRecurring: true, reason: "Rule matched keyword: zerodha" },
  { desc: "HDFC HIGH YIELD EMERGENCY SAVINGS TRANSFER", amount: 15000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 15, isRecurring: true, reason: "Rule matched keyword: emergency fund" },
  { desc: "ZERODHA NIFTY 50 INDEX SIP AUTO-DEPOSIT", amount: 30000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 32, isRecurring: true, reason: "Rule matched keyword: zerodha" },
  { desc: "HDFC HIGH YIELD EMERGENCY SAVINGS TRANSFER", amount: 15000.00, type: "SAVINGS", cat: "Savings & Investments", daysAgo: 45, isRecurring: true, reason: "Rule matched keyword: emergency fund" },
];

async function seed() {
  console.log("🌱 Seeding database with INR currency...");

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

  // 4. Create demo financial goals in INR
  await prisma.financialGoal.deleteMany({
    where: { userId: demoUser.id },
  });

  await prisma.financialGoal.createMany({
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

  // 5. Create demo budgets in INR
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
        amount: 18000.00,
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
        amount: 8000.00,
        month: currentMonth,
        year: currentYear,
      },
    });
  }

  console.log("✅ Seed completed successfully with INR default currency!");
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
