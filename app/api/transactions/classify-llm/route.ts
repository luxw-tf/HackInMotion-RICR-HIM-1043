import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { groupTransactionsByCounterparty } from "@/lib/categorization/counterparty";
import { classifyCounterpartiesWithClaude } from "@/lib/categorization/llmClassifier";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;
    const accountHolderName = session.user.name || "Account Holder";

    // 1. Fetch user's transactions
    const userTransactions = await prisma.transaction.findMany({
      where: { userId },
      select: {
        id: true,
        description: true,
        amount: true,
        date: true,
        categoryId: true,
      },
    });

    if (userTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No transactions found to classify.",
        metrics: {
          totalTransactions: 0,
          distinctCounterparties: 0,
          apiCallsMade: 0,
          reductionPercentage: 0,
          cachedHits: 0,
          updatedCount: 0,
        },
      });
    }

    // 2. Group transactions by normalized counterparty key
    const grouped = groupTransactionsByCounterparty(userTransactions);

    // 3. Batch classify distinct counterparties via Claude (15 per call in parallel)
    const result = await classifyCounterpartiesWithClaude(grouped, accountHolderName, 15);

    // 4. Fetch all category records
    const allCategories = await prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId }],
      },
    });

    const categoryMap = new Map<string, string>();
    allCategories.forEach((c) => {
      categoryMap.set(c.name.toLowerCase(), c.id);
    });

    // 5. Build lookup map
    const classificationMap = new Map<string, typeof result.classifications[0]>();
    result.classifications.forEach((c) => {
      classificationMap.set(c.counterpartyKey.toLowerCase(), c);
    });

    // 6. Safe database updates
    let updatedCount = 0;
    for (const tx of userTransactions) {
      const key = groupTransactionsByCounterparty([{ description: tx.description, amount: tx.amount }])[0]?.counterpartyKey;
      if (!key) continue;

      const matchedCls = classificationMap.get(key.toLowerCase());
      if (matchedCls) {
        const catId = categoryMap.get(matchedCls.category.toLowerCase()) || null;
        try {
          await prisma.transaction.update({
            where: { id: tx.id },
            data: {
              categoryId: catId,
              merchant: matchedCls.counterpartyKey,
              reasoning: `Claude LLM [${matchedCls.semanticFlag}]: ${matchedCls.reasoning}`,
            },
          });
          updatedCount++;
        } catch (updateErr) {
          // Non-blocking skip if row was concurrently deleted
          console.warn(`Could not update tx ${tx.id}:`, updateErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Classified ${updatedCount} transactions across ${result.distinctCounterparties} counterparties in ${result.apiCallsMade} parallel Claude API call(s).`,
      metrics: {
        totalTransactions: result.totalTransactions,
        distinctCounterparties: result.distinctCounterparties,
        apiCallsMade: result.apiCallsMade,
        reductionPercentage: result.reductionPercentage,
        cachedHits: result.cachedHits,
        updatedCount,
      },
      classifications: result.classifications,
    });
  } catch (error: any) {
    console.error("LLM Classification API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute LLM counterparty classification." },
      { status: 500 }
    );
  }
}
