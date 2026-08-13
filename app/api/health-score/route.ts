import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { computeFinancialHealthScore, TransactionData } from "@/lib/analytics/healthScore";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's scoped transactions
    const rawTransactions = await prisma.transaction.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            name: true,
            isEssential: true,
            type: true,
            color: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    // Fetch user's emergency fund / savings goals to calculate cash buffer accurately
    const savingsGoals = await prisma.financialGoal.findMany({
      where: { userId, status: "ACTIVE" },
      select: { currentAmount: true },
    });

    const totalSavedInGoals = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

    const formattedTransactions: TransactionData[] = rawTransactions.map((t) => ({
      id: t.id,
      amount: t.amount,
      type: t.type as "EXPENSE" | "INCOME" | "SAVINGS",
      date: t.date,
      description: t.description,
      merchant: t.merchant,
      category: t.category,
    }));

    const healthData = computeFinancialHealthScore(formattedTransactions, totalSavedInGoals);

    return NextResponse.json({
      success: true,
      data: healthData,
      transactionCount: rawTransactions.length,
    });
  } catch (error) {
    console.error("Health score API error:", error);
    return NextResponse.json(
      { error: "Failed to compute financial health score." },
      { status: 500 }
    );
  }
}
