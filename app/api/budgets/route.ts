import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = parseInt(searchParams.get("month") || (now.getMonth() + 1).toString(), 10);
    const year = parseInt(searchParams.get("year") || now.getFullYear().toString(), 10);

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
      include: {
        category: true,
      },
    });

    // Calculate actual spending per category for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const monthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
        type: "EXPENSE",
      },
      select: {
        categoryId: true,
        amount: true,
      },
    });

    const spendingByCategory = new Map<string, number>();
    monthTransactions.forEach((tx) => {
      const key = tx.categoryId || "uncategorized";
      spendingByCategory.set(key, (spendingByCategory.get(key) || 0) + tx.amount);
    });

    const budgetsWithActuals = budgets.map((b) => {
      const catKey = b.categoryId || "uncategorized";
      const spent = spendingByCategory.get(catKey) || 0;
      return {
        ...b,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round((b.amount - spent) * 100) / 100,
        percentUsed: Math.min(100, Math.round((spent / (b.amount || 1)) * 100)),
        isOverBudget: spent > b.amount,
      };
    });

    return NextResponse.json({
      success: true,
      data: budgetsWithActuals,
      month,
      year,
    });
  } catch (error) {
    console.error("Budgets GET error:", error);
    return NextResponse.json({ error: "Failed to fetch budgets." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { categoryId, amount, month, year } = body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Valid positive budget amount required." }, { status: 400 });
    }

    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    // Check if budget exists for this category/month
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId,
        categoryId: categoryId || null,
        month: targetMonth,
        year: targetYear,
      },
    });

    let budgetRecord;
    if (existingBudget) {
      budgetRecord = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { amount },
      });
    } else {
      budgetRecord = await prisma.budget.create({
        data: {
          userId,
          categoryId: categoryId || null,
          amount,
          month: targetMonth,
          year: targetYear,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Budget target saved.",
      data: budgetRecord,
    });
  } catch (error) {
    console.error("Budgets POST error:", error);
    return NextResponse.json({ error: "Failed to save budget." }, { status: 500 });
  }
}
