import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { categorizeTransaction } from "@/lib/categorization/rules";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { validRows, errors: clientErrors, filename } = body;

    if (!Array.isArray(validRows) || validRows.length === 0) {
      return NextResponse.json(
        {
          error: "No valid transaction rows found to import.",
          errors: clientErrors || [],
        },
        { status: 400 }
      );
    }

    // 1. Fetch user categories and accounts for mapping
    const [categories, userAccounts, existingTransactions] = await Promise.all([
      prisma.category.findMany({
        where: { OR: [{ userId: null }, { userId }] },
      }),
      prisma.financialAccount.findMany({
        where: { userId },
      }),
      // Fetch recent transactions for duplicate detection
      prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          date: true,
          description: true,
          merchant: true,
          amount: true,
        },
      }),
    ]);

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.name, c.id));

    const accountMap = new Map<string, string>();
    userAccounts.forEach((a) => accountMap.set(a.name.toLowerCase(), a.id));
    const defaultAccountId = userAccounts.length > 0 ? userAccounts[0].id : null;

    const importBatchId = `batch_${Date.now()}`;
    let insertedCount = 0;
    const duplicateRows: Array<{ description: string; amount: number; date: string; reason: string }> = [];
    const createdTransactions: any[] = [];

    // Helper to generate signature for exact duplicate checking
    const getSignature = (dateStr: string, desc: string, amt: number) =>
      `${dateStr}_${desc.trim().toLowerCase()}_${amt.toFixed(2)}`;

    // Set of existing transaction signatures
    const existingSignatures = new Set<string>();
    existingTransactions.forEach((tx) => {
      const dStr = new Date(tx.date).toISOString().split("T")[0];
      existingSignatures.add(getSignature(dStr, tx.description, tx.amount));
    });

    for (const row of validRows) {
      const desc = String(row.description || "").trim();
      const numAmt = parseFloat(row.amount);
      const rowDate = new Date(row.date);
      const dateStr = !isNaN(rowDate.getTime())
        ? rowDate.toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      if (!desc || isNaN(numAmt) || numAmt <= 0) {
        continue;
      }

      // Check for exact duplicate match
      const sig = getSignature(dateStr, desc, numAmt);
      if (existingSignatures.has(sig)) {
        duplicateRows.push({
          description: desc,
          amount: numAmt,
          date: dateStr,
          reason: `Exact match with existing transaction on ${dateStr} (₹${numAmt.toFixed(2)})`,
        });
        continue;
      }

      // Register this signature to prevent intra-batch duplicates as well
      existingSignatures.add(sig);

      // Run deterministic categorization
      const catResult = categorizeTransaction(desc, numAmt);
      const catId = categoryMap.get(catResult.categoryName) || null;

      // Account association if provided
      let accountId = defaultAccountId;
      if (row.accountName) {
        const matchedAccId = accountMap.get(String(row.accountName).toLowerCase());
        if (matchedAccId) accountId = matchedAccId;
      }

      const tx = await prisma.transaction.create({
        data: {
          userId,
          accountId,
          categoryId: catId,
          amount: numAmt,
          type: row.type || catResult.type,
          date: !isNaN(rowDate.getTime()) ? rowDate : new Date(),
          description: desc,
          merchant: catResult.cleanedMerchant,
          source: "CSV_IMPORT",
          importBatchId,
          reasoning: catResult.reasoning,
        },
      });

      createdTransactions.push(tx);
      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Import complete: ${insertedCount} inserted, ${duplicateRows.length} duplicates skipped, ${clientErrors?.length || 0} malformed rows excluded.`,
      insertedCount,
      duplicateCount: duplicateRows.length,
      skippedCount: clientErrors?.length || 0,
      batchId: importBatchId,
      duplicates: duplicateRows,
      errors: clientErrors || [],
    });
  } catch (error) {
    console.error("Import CSV API error:", error);
    return NextResponse.json(
      { error: "Failed to process bank statement import." },
      { status: 500 }
    );
  }
}
