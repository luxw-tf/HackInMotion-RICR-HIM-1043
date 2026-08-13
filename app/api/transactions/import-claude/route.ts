import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { parseStatementWithClaude } from "@/lib/importer/directClaudeParser";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;
    const accountHolderName = session.user.name || "Account Holder";
    const body = await req.json();
    const { rawContent, filename } = body;

    if (!rawContent || typeof rawContent !== "string" || !rawContent.trim()) {
      return NextResponse.json(
        { error: "Statement content is required for Claude processing." },
        { status: 400 }
      );
    }

    // 1. Give statement directly to Claude
    const parsedTransactions = await parseStatementWithClaude(rawContent, accountHolderName);

    if (!Array.isArray(parsedTransactions) || parsedTransactions.length === 0) {
      return NextResponse.json(
        { error: "Claude was unable to extract valid transactions from this file." },
        { status: 400 }
      );
    }

    // 2. Fetch categories and accounts
    const [categories, userAccounts, existingTransactions] = await Promise.all([
      prisma.category.findMany({
        where: { OR: [{ userId: null }, { userId }] },
      }),
      prisma.financialAccount.findMany({
        where: { userId },
      }),
      prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          date: true,
          description: true,
          amount: true,
        },
      }),
    ]);

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.name.toLowerCase(), c.id));
    const defaultAccountId = userAccounts.length > 0 ? userAccounts[0].id : null;

    // Helper for duplicate detection
    const getSignature = (dateStr: string, desc: string, amt: number) =>
      `${dateStr}_${desc.trim().toLowerCase()}_${amt.toFixed(2)}`;

    const existingSignatures = new Set<string>();
    existingTransactions.forEach((tx) => {
      const dStr = new Date(tx.date).toISOString().split("T")[0];
      existingSignatures.add(getSignature(dStr, tx.description, tx.amount));
    });

    const importBatchId = `claude_batch_${Date.now()}`;
    let insertedCount = 0;
    const duplicates: any[] = [];
    const insertedRecords: any[] = [];

    for (const tx of parsedTransactions) {
      const numAmt = Math.abs(Number(tx.amount) || 0);
      const dateObj = new Date(tx.date);
      const dateStr = !isNaN(dateObj.getTime())
        ? dateObj.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      if (!tx.description || numAmt <= 0) continue;

      const sig = getSignature(dateStr, tx.description, numAmt);
      if (existingSignatures.has(sig)) {
        duplicates.push({
          description: tx.description,
          amount: numAmt,
          date: dateStr,
          reason: `Exact duplicate matching existing record on ${dateStr}`,
        });
        continue;
      }
      existingSignatures.add(sig);

      const catId = categoryMap.get((tx.categoryName || "").toLowerCase()) || null;

      const created = await prisma.transaction.create({
        data: {
          userId,
          accountId: defaultAccountId,
          categoryId: catId,
          amount: numAmt,
          type: tx.type || "EXPENSE",
          date: !isNaN(dateObj.getTime()) ? dateObj : new Date(),
          description: tx.description,
          merchant: tx.merchant || tx.description,
          source: "CSV_IMPORT",
          importBatchId,
          reasoning: `Claude AI: ${tx.reasoning}`,
        },
      });

      insertedRecords.push(created);
      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Claude processed statement: ${insertedCount} transactions categorized & imported, ${duplicates.length} duplicates skipped.`,
      insertedCount,
      duplicateCount: duplicates.length,
      batchId: importBatchId,
      transactions: insertedRecords,
      duplicates,
    });
  } catch (error: any) {
    console.error("Direct Claude Import API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process bank statement with Claude." },
      { status: 500 }
    );
  }
}
