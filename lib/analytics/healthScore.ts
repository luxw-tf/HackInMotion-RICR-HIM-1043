export interface TransactionData {
  id: string;
  amount: number;
  type: "EXPENSE" | "INCOME" | "SAVINGS";
  date: Date | string;
  description: string;
  merchant?: string | null;
  category?: {
    name: string;
    isEssential: boolean;
    type: string;
    color?: string;
  } | null;
}

export interface MetricBreakdown {
  score: number; // 0 - 100
  weight: number; // percentage
  status: "EXCELLENT" | "HEALTHY" | "FAIR" | "ATTENTION_NEEDED";
  value: number; // actual % or ratio
  target: string;
  label: string;
  explanation: string;
}

export interface InsightCard {
  id: string;
  type: "POSITIVE" | "WARNING" | "TIP" | "NEUTRAL";
  title: string;
  message: string;
  metric?: string;
  actionableStep?: string;
}

export interface HealthScoreResult {
  overallScore: number;
  tier: "PRISTINE" | "STRONG" | "STABLE" | "BUILDING" | "CRITICAL";
  headline: string;
  summary: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number; // 0-100%
  essentialRatio: number; // 0-100%
  discretionaryRatio: number; // 0-100%
  bufferMonths: number;
  breakdown: {
    savingsRate: MetricBreakdown;
    essentialRatio: MetricBreakdown;
    discretionaryRatio: MetricBreakdown;
    cashflowConsistency: MetricBreakdown;
  };
  insights: InsightCard[];
  recurringSubscriptions: Array<{
    merchant: string;
    amount: number;
    frequency: string;
    category: string;
  }>;
  categoryTotals: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
    isEssential: boolean;
  }>;
}

export function computeFinancialHealthScore(
  transactions: TransactionData[],
  existingSavingsBalance: number = 0
): HealthScoreResult {
  // Empty data state handling
  if (!transactions || transactions.length === 0) {
    return {
      overallScore: 0,
      tier: "BUILDING",
      headline: "No transaction data available",
      summary: "Import your bank statements or add transactions to compute an honest picture of your financial health.",
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlySavings: 0,
      savingsRate: 0,
      essentialRatio: 0,
      discretionaryRatio: 0,
      bufferMonths: 0,
      breakdown: {
        savingsRate: { score: 0, weight: 35, status: "ATTENTION_NEEDED", value: 0, target: "≥ 20%", label: "Savings Rate", explanation: "Add income and savings records to calculate." },
        essentialRatio: { score: 0, weight: 30, status: "ATTENTION_NEEDED", value: 0, target: "≤ 50%", label: "Essentials (Needs)", explanation: "Add living expense data to analyze baseline needs." },
        discretionaryRatio: { score: 0, weight: 20, status: "ATTENTION_NEEDED", value: 0, target: "≤ 30%", label: "Discretionary (Wants)", explanation: "Add flexible expense data to track non-essentials." },
        cashflowConsistency: { score: 0, weight: 15, status: "ATTENTION_NEEDED", value: 0, target: "Positive Margin", label: "Cash Flow Stability", explanation: "Need at least one month of transaction history." },
      },
      insights: [
        {
          id: "empty-1",
          type: "NEUTRAL",
          title: "Awaiting Data",
          message: "Upload a CSV statement or test with Sample Demo Data to view real analytics, patterns, and health metrics.",
          actionableStep: "Click 'Upload Statement' or 'Load Demo Data' to get started.",
        }
      ],
      recurringSubscriptions: [],
      categoryTotals: [],
    };
  }

  // Aggregate totals
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalEssentialExpenses = 0;
  let totalDiscretionaryExpenses = 0;
  let explicitSavings = 0;

  const categoryMap = new Map<string, { amount: number; isEssential: boolean; color: string }>();
  const merchantCount = new Map<string, { amounts: number[]; dates: Date[]; category: string }>();

  // Determine span of transaction dates
  const dates = transactions.map((t) => new Date(t.date).getTime()).filter((d) => !isNaN(d));
  const minDate = dates.length > 0 ? Math.min(...dates) : Date.now();
  const maxDate = dates.length > 0 ? Math.max(...dates) : Date.now();
  const daysSpan = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
  const monthsSpan = Math.max(1, daysSpan / 30.42);

  for (const t of transactions) {
    const amt = Math.abs(t.amount);
    const catName = t.category?.name || "Uncategorized";
    const isEssential = t.category?.isEssential ?? false;
    const catColor = t.category?.color || "#94a3b8";

    if (t.type === "INCOME" || catName === "Income") {
      totalIncome += amt;
    } else if (t.type === "SAVINGS" || catName === "Savings & Investments") {
      explicitSavings += amt;
    } else {
      totalExpenses += amt;
      if (isEssential) {
        totalEssentialExpenses += amt;
      } else {
        totalDiscretionaryExpenses += amt;
      }

      // Aggregate category map
      const existing = categoryMap.get(catName) || { amount: 0, isEssential, color: catColor };
      existing.amount += amt;
      categoryMap.set(catName, existing);

      // Track for recurring detection
      const merchantKey = (t.merchant || t.description).trim().toLowerCase();
      if (merchantKey.length > 2) {
        const mData = merchantCount.get(merchantKey) || { amounts: [], dates: [], category: catName };
        mData.amounts.push(amt);
        mData.dates.push(new Date(t.date));
        merchantCount.set(merchantKey, mData);
      }
    }
  }

  // Monthly normalized figures
  const monthlyIncome = totalIncome / monthsSpan;
  const monthlyExpenses = totalExpenses / monthsSpan;
  const monthlySavings = (explicitSavings + Math.max(0, totalIncome - totalExpenses - explicitSavings)) / monthsSpan;

  // Rate calculations (relative to total income or default 1 if no income logged)
  const incomeBase = Math.max(1, totalIncome);
  const calculatedSavingsRate = Math.min(100, Math.max(0, ((totalIncome - totalExpenses) / incomeBase) * 100));
  const calculatedEssentialRatio = Math.min(100, (totalEssentialExpenses / incomeBase) * 100);
  const calculatedDiscretionaryRatio = Math.min(100, (totalDiscretionaryExpenses / incomeBase) * 100);

  // 1. Savings Score (35% weight)
  // 20% or higher = 100, linearly scale down
  let savingsScore = 0;
  if (calculatedSavingsRate >= 20) {
    savingsScore = 100;
  } else if (calculatedSavingsRate > 0) {
    savingsScore = Math.round(50 + (calculatedSavingsRate / 20) * 50);
  } else {
    savingsScore = Math.max(10, Math.round(50 - (Math.abs(calculatedSavingsRate) / 20) * 40));
  }

  // 2. Essential Needs Score (30% weight)
  // ≤ 50% = 100, 50-70% = 90-50, >70% = degraded
  let essentialScore = 0;
  if (calculatedEssentialRatio <= 50) {
    essentialScore = 100;
  } else if (calculatedEssentialRatio <= 70) {
    essentialScore = Math.round(100 - ((calculatedEssentialRatio - 50) / 20) * 40);
  } else {
    essentialScore = Math.max(10, Math.round(60 - ((calculatedEssentialRatio - 70) / 30) * 50));
  }

  // 3. Discretionary Wants Score (20% weight)
  // ≤ 30% = 100, 30-50% = 90-50, >50% = degraded
  let discretionaryScore = 0;
  if (calculatedDiscretionaryRatio <= 30) {
    discretionaryScore = 100;
  } else if (calculatedDiscretionaryRatio <= 50) {
    discretionaryScore = Math.round(100 - ((calculatedDiscretionaryRatio - 30) / 20) * 40);
  } else {
    discretionaryScore = Math.max(10, Math.round(60 - ((calculatedDiscretionaryRatio - 50) / 30) * 50));
  }

  // 4. Cash Flow & Runway Score (15% weight)
  const netMargin = totalIncome - totalExpenses;
  const cashflowScore = netMargin > 0 ? (netMargin / incomeBase >= 0.15 ? 100 : 80) : Math.max(20, Math.round(60 + (netMargin / (totalExpenses || 1)) * 40));

  // Weighted overall calculation
  const weightedOverall = Math.round(
    savingsScore * 0.35 +
    essentialScore * 0.30 +
    discretionaryScore * 0.20 +
    cashflowScore * 0.15
  );

  const overallScore = Math.max(0, Math.min(100, weightedOverall));

  // Tier assignment
  let tier: "PRISTINE" | "STRONG" | "STABLE" | "BUILDING" | "CRITICAL" = "BUILDING";
  let headline = "";
  let summary = "";

  if (overallScore >= 85) {
    tier = "PRISTINE";
    headline = "Excellent Financial Health";
    summary = "Your cash flow is strong, essential expenses are disciplined, and your savings buffer provides solid resilience.";
  } else if (overallScore >= 70) {
    tier = "STRONG";
    headline = "Strong Financial Foundation";
    summary = "You have healthy margins and steady savings habits, with minor room to optimize non-essential subscriptions.";
  } else if (overallScore >= 55) {
    tier = "STABLE";
    headline = "Stable with Optimization Opportunities";
    summary = "Your expenses are covered, but essential costs or discretionary leaks leave less margin than ideal for long-term growth.";
  } else if (overallScore >= 40) {
    tier = "BUILDING";
    headline = "Needs Margin Expansion";
    summary = "Spending is consuming the vast majority of income. Building a clearer buffer will safeguard against unexpected costs.";
  } else {
    tier = "CRITICAL";
    headline = "Immediate Cash Flow Deficit";
    summary = "Current monthly outflow exceeds net earnings. Prioritize cutting non-essential recurring costs to restore balance.";
  }

  // Buffer calculation
  const monthlyLivingCost = monthlyExpenses > 0 ? monthlyExpenses : 1;
  const estimatedCashReserve = existingSavingsBalance > 0 ? existingSavingsBalance : Math.max(0, totalIncome - totalExpenses);
  const bufferMonths = Number((estimatedCashReserve / monthlyLivingCost).toFixed(1));

  // Generate plain-language insight cards
  const insights: InsightCard[] = [];

  // Insight 1: 50/30/20 Rule Analysis
  if (calculatedEssentialRatio > 60) {
    insights.push({
      id: "insight-essential-high",
      type: "WARNING",
      title: "Essential Expenses Exceed Benchmark",
      message: `Fixed essentials (housing, utilities, transportation) currently consume ${calculatedEssentialRatio.toFixed(0)}% of your income (recommended benchmark: ≤ 50%).`,
      metric: `${calculatedEssentialRatio.toFixed(0)}% vs 50% target`,
      actionableStep: "Review recurring utility plans, insurance quotes, and transport costs to reclaim breathing room.",
    });
  } else {
    insights.push({
      id: "insight-essential-good",
      type: "POSITIVE",
      title: "Controlled Living Overhead",
      message: `Your necessary living expenses are lean at ${calculatedEssentialRatio.toFixed(0)}% of earnings, giving you freedom to save and invest.`,
      metric: `${calculatedEssentialRatio.toFixed(0)}% of income`,
    });
  }

  // Insight 2: Savings Rate Evaluation
  if (calculatedSavingsRate >= 20) {
    insights.push({
      id: "insight-savings-strong",
      type: "POSITIVE",
      title: "Strong Savings Momentum",
      message: `You are retaining ${calculatedSavingsRate.toFixed(0)}% of net cash flow, surpassing the standard 20% wealth-building threshold.`,
      metric: `${calculatedSavingsRate.toFixed(0)}% savings rate`,
      actionableStep: "Consider allocating excess surplus into diversified index funds or tax-advantaged retirement accounts.",
    });
  } else if (calculatedSavingsRate > 0) {
    insights.push({
      id: "insight-savings-modest",
      type: "TIP",
      title: "Savings Rate Has Growth Room",
      message: `You are saving ${calculatedSavingsRate.toFixed(0)}% of income. Increasing this to 20% adds an extra $${Math.round((monthlyIncome * 0.2) - (monthlyIncome * calculatedSavingsRate / 100))} monthly toward your safety cushion.`,
      metric: `${calculatedSavingsRate.toFixed(0)}% (Target 20%)`,
      actionableStep: "Set up an automatic recurring transfer on payday to pay yourself first.",
    });
  } else {
    insights.push({
      id: "insight-savings-deficit",
      type: "WARNING",
      title: "Negative Monthly Net Cashflow",
      message: `Outflows currently exceed inflows by $${Math.round(Math.abs(monthlyIncome - monthlyExpenses))}/month.`,
      metric: `-$${Math.round(Math.abs(monthlyIncome - monthlyExpenses))}/mo`,
      actionableStep: "Trim flexible dining, entertainment, and shopping expenses to stop the deficit.",
    });
  }

  // Detect recurring patterns (subscriptions / repeat monthly items)
  const recurringSubscriptions: Array<{ merchant: string; amount: number; frequency: string; category: string }> = [];
  merchantCount.forEach((data, merchant) => {
    if (data.amounts.length >= 2) {
      // Check if amounts are nearly identical
      const avgAmt = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
      const allSimilar = data.amounts.every((a) => Math.abs(a - avgAmt) < 5);
      if (allSimilar && avgAmt > 3) {
        recurringSubscriptions.push({
          merchant: merchant.charAt(0).toUpperCase() + merchant.slice(1),
          amount: Math.round(avgAmt * 100) / 100,
          frequency: "Monthly",
          category: data.category,
        });
      }
    }
  });

  if (recurringSubscriptions.length > 0) {
    const totalSubCost = recurringSubscriptions.reduce((s, r) => s + r.amount, 0);
    insights.push({
      id: "insight-recurring-subs",
      type: "TIP",
      title: `${recurringSubscriptions.length} Recurring Subscriptions Detected`,
      message: `We identified recurring monthly charges totaling ~$${Math.round(totalSubCost)}/month across streaming, utilities, and services.`,
      metric: `$${Math.round(totalSubCost)}/mo committed`,
      actionableStep: "Audit recurring charges to cancel unutilized subscriptions or renegotiate provider plans.",
    });
  }

  // Category totals array
  const totalCatSum = Array.from(categoryMap.values()).reduce((acc, curr) => acc + curr.amount, 0) || 1;
  const categoryTotals = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    amount: Math.round(data.amount * 100) / 100,
    percentage: Math.round((data.amount / totalCatSum) * 100),
    color: data.color,
    isEssential: data.isEssential,
  })).sort((a, b) => b.amount - a.amount);

  return {
    overallScore,
    tier,
    headline,
    summary,
    monthlyIncome: Math.round(monthlyIncome),
    monthlyExpenses: Math.round(monthlyExpenses),
    monthlySavings: Math.round(monthlySavings),
    savingsRate: Number(calculatedSavingsRate.toFixed(1)),
    essentialRatio: Number(calculatedEssentialRatio.toFixed(1)),
    discretionaryRatio: Number(calculatedDiscretionaryRatio.toFixed(1)),
    bufferMonths,
    breakdown: {
      savingsRate: {
        score: savingsScore,
        weight: 35,
        status: savingsScore >= 80 ? "EXCELLENT" : savingsScore >= 60 ? "HEALTHY" : savingsScore >= 40 ? "FAIR" : "ATTENTION_NEEDED",
        value: Number(calculatedSavingsRate.toFixed(1)),
        target: "≥ 20%",
        label: "Savings Rate",
        explanation: `${calculatedSavingsRate.toFixed(1)}% of net earnings retained for emergency reserve and investments.`,
      },
      essentialRatio: {
        score: essentialScore,
        weight: 30,
        status: essentialScore >= 80 ? "EXCELLENT" : essentialScore >= 60 ? "HEALTHY" : essentialScore >= 40 ? "FAIR" : "ATTENTION_NEEDED",
        value: Number(calculatedEssentialRatio.toFixed(1)),
        target: "≤ 50%",
        label: "Essentials (Needs)",
        explanation: `${calculatedEssentialRatio.toFixed(1)}% of income spent on baseline non-negotiable living needs.`,
      },
      discretionaryRatio: {
        score: discretionaryScore,
        weight: 20,
        status: discretionaryScore >= 80 ? "EXCELLENT" : discretionaryScore >= 60 ? "HEALTHY" : discretionaryScore >= 40 ? "FAIR" : "ATTENTION_NEEDED",
        value: Number(calculatedDiscretionaryRatio.toFixed(1)),
        target: "≤ 30%",
        label: "Discretionary (Wants)",
        explanation: `${calculatedDiscretionaryRatio.toFixed(1)}% spent on lifestyle, entertainment, dining, and shopping.`,
      },
      cashflowConsistency: {
        score: cashflowScore,
        weight: 15,
        status: cashflowScore >= 80 ? "EXCELLENT" : cashflowScore >= 60 ? "HEALTHY" : cashflowScore >= 40 ? "FAIR" : "ATTENTION_NEEDED",
        value: Math.round(netMargin),
        target: "> $0 Net",
        label: "Net Cash Flow",
        explanation: netMargin >= 0 ? `Net positive cashflow buffer of $${Math.round(netMargin)} maintained.` : `Deficit of $${Math.round(Math.abs(netMargin))} requires budget balancing.`,
      },
    },
    insights,
    recurringSubscriptions,
    categoryTotals,
  };
}
