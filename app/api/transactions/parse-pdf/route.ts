import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parseFlexibleDate, parseAmountString, ParsedTransactionRow, ParseRowError } from "@/lib/importer/statementParser";
import { parseStatementWithClaude } from "@/lib/importer/directClaudeParser";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const accountHolderName = session.user.name || "Account Holder";
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const password = (formData.get("password") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamically import pdfjs-dist and worker for Node.js App Router & Vercel serverless environment
    // @ts-ignore
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
    // @ts-ignore
    await import("pdfjs-dist/legacy/build/pdf.worker.js");
    
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerPort = null;
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";
    }


    let doc;
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(buffer),
        password: password || undefined,
        useSystemFonts: true,
        disableFontFace: true,
        isEvalSupported: false,
      });

      doc = await loadingTask.promise;
    } catch (pdfErr: any) {
      if (
        pdfErr.name === "PasswordException" ||
        pdfErr.message?.toLowerCase().includes("password") ||
        pdfErr.code === 1 || // NEED_PASSWORD
        pdfErr.code === 2    // INCORRECT_PASSWORD
      ) {
        return NextResponse.json(
          {
            error: "PASSWORD_REQUIRED",
            message: password
              ? "Incorrect password for this bank statement. Please check and re-enter."
              : "This bank statement PDF is password-protected. Please enter the password (e.g. DOB + PAN/Account digits).",
          },
          { status: 422 }
        );
      }
      throw pdfErr;
    }

    const numPages = doc.numPages;
    const allLines: string[] = [];

    // Extract text line by line across all pages
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Group text items by vertical Y-coordinate buckets
      const items = textContent.items as Array<{ str: string; transform: number[] }>;
      const rowMap = new Map<number, string[]>();

      for (const item of items) {
        if (!item.str || !item.str.trim()) continue;
        const y = Math.round(item.transform[5] / 4) * 4;
        if (!rowMap.has(y)) rowMap.set(y, []);
        rowMap.get(y)!.push(item.str.trim());
      }

      // Sort rows top to bottom
      const sortedY = Array.from(rowMap.keys()).sort((a, b) => b - a);
      for (const y of sortedY) {
        const line = rowMap.get(y)!.join("   ");
        if (line.trim()) {
          allLines.push(line.trim());
        }
      }
    }

    const fullStatementText = allLines.join("\n");

    // 1. Try Direct Claude Statement Parser if API key is available
    if (process.env.ANTHROPIC_API_KEY && fullStatementText.length > 50) {
      try {
        const claudeResults = await parseStatementWithClaude(fullStatementText, accountHolderName);

        if (Array.isArray(claudeResults) && claudeResults.length > 0) {
          const validRows: ParsedTransactionRow[] = claudeResults.map((tx, idx) => {
            const parsedDate = parseFlexibleDate(tx.date) || new Date();
            return {
              date: parsedDate,
              dateStr: tx.date || parsedDate.toISOString().split("T")[0],
              description: tx.description || tx.merchant,
              amount: Math.abs(tx.amount),
              type: tx.type === "INCOME" ? "INCOME" : "EXPENSE",
              rawRow: { merchant: tx.merchant, reasoning: tx.reasoning },
              rowIndex: idx + 1,
            };
          });

          return NextResponse.json({
            success: true,
            validRows,
            errors: [],
            totalRowsProcessed: validRows.length,
            detectedFormat: "PDF_STATEMENT_CLAUDE_AI",
            filename: file.name,
            pageCount: numPages,
          });
        }
      } catch (claudeErr) {
        console.warn("Claude PDF extraction fallback to heuristic parser:", claudeErr);
      }
    }

    // 2. Deterministic Rule-Based Fallback Parser with accurate Debit vs Credit detection
    const validRows: ParsedTransactionRow[] = [];
    const errors: ParseRowError[] = [];
    const dateRegex = /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}[\/\-\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\/\-\s]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/i;

    let rowIndex = 0;

    for (const line of allLines) {
      rowIndex++;
      const dateMatch = line.match(dateRegex);
      if (!dateMatch) continue;

      const dateStr = dateMatch[0];
      const parsedDate = parseFlexibleDate(dateStr);
      if (!parsedDate) continue;

      const amountMatches = line.match(/(?:[₹\$]\s*)?[\d,]+\.\d{2}(?:\s*(?:Dr|Cr|Debit|Credit))?/gi);
      if (!amountMatches || amountMatches.length === 0) continue;

      const primaryAmtStr = amountMatches[0];
      const parsedAmount = parseAmountString(primaryAmtStr);
      if (!parsedAmount || parsedAmount.amount <= 0) continue;

      // Extract Narration
      let narration = line
        .replace(dateMatch[0], "")
        .replace(/(?:[₹\$]\s*)?[\d,]+\.\d{2}(?:\s*(?:Dr|Cr|Debit|Credit))?/gi, "")
        .replace(/\b(?:UPI|IMPS|NEFT|RTGS|POS|ATM|ACH|INF|CHQ|REF|TXN)\b/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim();

      if (!narration || narration.length < 2) {
        narration = "Bank Transaction " + dateStr;
      }

      // Accurate Debit vs Credit classification:
      const upperLine = line.toUpperCase();
      const isExplicitCredit =
        upperLine.includes("UPI/CR") ||
        upperLine.includes("/CR/") ||
        upperLine.includes(" CR") ||
        upperLine.includes("CREDIT") ||
        upperLine.includes("SALARY") ||
        upperLine.includes("REFUND") ||
        upperLine.includes("DIVIDEND") ||
        upperLine.includes("INTEREST PAID");

      const isExplicitDebit =
        upperLine.includes("UPI/DR") ||
        upperLine.includes("/DR/") ||
        upperLine.includes(" DR") ||
        upperLine.includes("DEBIT") ||
        upperLine.includes("WDL") ||
        upperLine.includes("WITHDRAWAL") ||
        upperLine.includes("POS") ||
        upperLine.includes("PURCHASE") ||
        upperLine.includes("PAID") ||
        parsedAmount.isNegative;

      let txType: "EXPENSE" | "INCOME" = "EXPENSE"; // Default to EXPENSE (debit)
      if (isExplicitCredit && !isExplicitDebit) {
        txType = "INCOME";
      }

      validRows.push({
        date: parsedDate,
        dateStr: parsedDate.toISOString().split("T")[0],
        description: narration,
        amount: parsedAmount.amount,
        type: txType,
        rawRow: { line },
        rowIndex,
      });
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        {
          error: "NO_TRANSACTIONS_FOUND",
          message: "Could not detect tabular transaction rows in this PDF statement. You may also export as CSV from your netbanking portal.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      validRows,
      errors,
      totalRowsProcessed: validRows.length,
      detectedFormat: "PDF_STATEMENT",
      filename: file.name,
      pageCount: numPages,
    });
  } catch (error: any) {
    console.error("PDF Parsing API error:", error);
    return NextResponse.json(
      { error: "PDF_PARSE_FAILED", message: error.message || "Failed to process PDF statement." },
      { status: 500 }
    );
  }
}
