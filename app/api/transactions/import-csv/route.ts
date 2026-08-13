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
    const { rows, filename } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No valid transaction rows found in uploaded statement." }, { status: 400 });
    }

    // Fetch user categories
    const categories = await prisma.category.findMany({
      where: { OR: [{ userId: null }, { userId }] },
    });

    const categoryMap = new Map<string, string>();
    categories.forEach((c) => categoryMap.set(c.name, c.id));

    const importBatchId = `batch_${Date.now()}`;
    let insertedCount = 0;
    let skippedCount = 0;

    for (const row of rows) {
      const desc = (row.description || row.merchant || row.memo || "").trim();
      const rawAmt = parseFloat(row.amount);
      const dateVal = row.date ? new Date(row.date) : new Date();

      if (!desc || isNaN(rawAmt)) {
        skippedCount++;
        continue;
      }

      // Check if categorization rule matches
      const catResult = categorizeTransaction(desc, rawAmt);
      const catId = categoryMap.get(catResult.categoryName) || null;

      await prisma.transaction.create({
        data: {
          userId,
          categoryId: catId,
          amount: Math.abs(rawAmt),
          type: row.type || catResult.type,
          date: isNaN(dateVal.getTime()) ? new Date() : dateVal,
          description: desc,
          merchant: catResult.cleanedMerchant,
          source: "CSV_IMPORT",
          importBatchId,
          reasoning: catResult.reasoning,
        },
      });

      insertedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedCount} transactions (${skippedCount} skipped due to invalid format).`,
      insertedCount,
      skippedCount,
      batchId: importBatchId,
    });
  } catch (error) {
    console.error("Import CSV API error:", error);
    return NextResponse.json(
      { error: "Failed to process bank statement import." },
      { status: 500 }
    );
  }
}
