import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { SAMPLE_TRANSACTIONS } from "@/lib/sampleData";
import { categorizeTransaction } from "@/lib/categorization/rules";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch system default categories
    const categories = await prisma.category.findMany({
      where: { OR: [{ userId: null }, { userId }] },
    });

    const categoryMap = new Map<string, string>();
    categories.forEach((cat) => categoryMap.set(cat.name, cat.id));

    // Clear existing transactions for this user
    await prisma.transaction.deleteMany({
      where: { userId },
    });

    const now = new Date();

    // Insert sample transactions
    for (const item of SAMPLE_TRANSACTIONS) {
      const txDate = new Date(now.getTime() - item.daysAgo * 24 * 60 * 60 * 1000);
      const catId = categoryMap.get(item.categoryName) || null;
      const catResult = categorizeTransaction(item.description, item.amount);

      await prisma.transaction.create({
        data: {
          userId,
          categoryId: catId,
          amount: item.amount,
          type: item.type,
          date: txDate,
          description: item.description,
          merchant: catResult.cleanedMerchant,
          source: "DEMO_SEED",
          isRecurring: item.isRecurring || false,
          reasoning: catResult.reasoning,
        },
      });
    }

    // Ensure sample goals exist for the user
    const existingGoals = await prisma.financialGoal.findMany({
      where: { userId },
    });

    if (existingGoals.length === 0) {
      await prisma.financialGoal.createMany({
        data: [
          {
            userId,
            name: "Emergency Reserve (6 Months)",
            targetAmount: 15000.00,
            currentAmount: 9500.00,
            categoryType: "EMERGENCY_FUND",
            status: "ACTIVE",
            targetDate: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000),
          },
          {
            userId,
            name: "Roth IRA Max Contribution",
            targetAmount: 7000.00,
            currentAmount: 4200.00,
            categoryType: "RETIREMENT",
            status: "ACTIVE",
            targetDate: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully seeded realistic financial transactions and goals.",
    });
  } catch (error) {
    console.error("Seed demo API error:", error);
    return NextResponse.json(
      { error: "Failed to seed demo transactions." },
      { status: 500 }
    );
  }
}
