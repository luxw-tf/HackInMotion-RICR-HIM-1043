import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;

    const goals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const goalsWithProgress = goals.map((g) => ({
      ...g,
      progressPercent: Math.min(100, Math.round((g.currentAmount / (g.targetAmount || 1)) * 100)),
      remaining: Math.max(0, g.targetAmount - g.currentAmount),
    }));

    return NextResponse.json({
      success: true,
      data: goalsWithProgress,
    });
  } catch (error) {
    console.error("Goals GET error:", error);
    return NextResponse.json({ error: "Failed to fetch savings goals." }, { status: 500 });
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
    const { name, targetAmount, currentAmount, targetDate, categoryType, notes } = body;

    if (!name || typeof targetAmount !== "number" || targetAmount <= 0) {
      return NextResponse.json({ error: "Goal name and positive target amount required." }, { status: 400 });
    }

    const newGoal = await prisma.savingsGoal.create({
      data: {
        userId,
        name: name.trim(),
        targetAmount,
        currentAmount: typeof currentAmount === "number" ? currentAmount : 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        categoryType: categoryType || "EMERGENCY_FUND",
        status: "ACTIVE",
        notes: notes ? notes.trim() : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Savings goal created.",
        data: newGoal,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Goals POST error:", error);
    return NextResponse.json({ error: "Failed to create savings goal." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { id, currentAmount, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Goal ID is required." }, { status: 400 });
    }

    // Strictly user scoped verification
    const existing = await prisma.savingsGoal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Savings goal not found." }, { status: 404 });
    }

    const updated = await prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(typeof currentAmount === "number" ? { currentAmount } : {}),
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Savings goal progress updated.",
      data: updated,
    });
  } catch (error) {
    console.error("Goals PUT error:", error);
    return NextResponse.json({ error: "Failed to update savings goal." }, { status: 500 });
  }
}
