import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { categorizeTransaction } from "@/lib/categorization/rules";

export const dynamic = "force-dynamic";


export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);

    const categoryId = searchParams.get("categoryId");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const whereClause: any = { userId };

    if (categoryId && categoryId !== "ALL") {
      whereClause.categoryId = categoryId;
    }

    if (type && type !== "ALL") {
      whereClause.type = type;
    }

    if (search && search.trim().length > 0) {
      whereClause.OR = [
        { description: { contains: search } },
        { merchant: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
            icon: true,
            isEssential: true,
          },
        },
      },
      orderBy: { date: "desc" },
      take: Math.min(limit, 500),
    });

    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Transactions GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions." },
      { status: 500 }
    );
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

    const { description, amount, date, customCategoryId, notes, isRecurring } = body;

    if (!description || typeof amount !== "number" || isNaN(amount)) {
      return NextResponse.json(
        { error: "Valid description and numeric amount are required." },
        { status: 400 }
      );
    }

    let finalCategoryId = customCategoryId || null;
    let finalType: "EXPENSE" | "INCOME" | "SAVINGS" = amount < 0 ? "EXPENSE" : "EXPENSE";
    let reasoning = "Manually assigned category";
    let cleanedMerchant = description.trim();

    // If no category was explicitly forced by the user, run deterministic rule engine
    if (!finalCategoryId) {
      const catResult = categorizeTransaction(description, amount);
      finalType = catResult.type;
      reasoning = catResult.reasoning;
      cleanedMerchant = catResult.cleanedMerchant;

      // Find matching category record
      const matchedCat = await prisma.category.findFirst({
        where: {
          name: catResult.categoryName,
          OR: [{ userId: null }, { userId }],
        },
      });

      if (matchedCat) {
        finalCategoryId = matchedCat.id;
      }
    } else {
      const selectedCat = await prisma.category.findUnique({
        where: { id: finalCategoryId },
      });
      if (selectedCat) {
        finalType = selectedCat.type as any;
      }
    }

    const newTx = await prisma.transaction.create({
      data: {
        userId,
        description: description.trim(),
        merchant: cleanedMerchant,
        amount: Math.abs(amount),
        type: finalType,
        date: date ? new Date(date) : new Date(),
        categoryId: finalCategoryId,
        notes: notes ? notes.trim() : null,
        isRecurring: !!isRecurring,
        reasoning,
        source: "MANUAL",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Transaction recorded and categorized.",
        data: newTx,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Transactions POST error:", error);
    return NextResponse.json(
      { error: "Failed to record transaction." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Transaction ID required." }, { status: 400 });
    }

    // Strictly user scoped deletion
    await prisma.transaction.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Transaction deleted." });
  } catch (error) {
    console.error("Transactions DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete transaction." },
      { status: 500 }
    );
  }
}
