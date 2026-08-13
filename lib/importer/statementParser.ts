import { parse, isValid } from "date-fns";

export interface ParsedTransactionRow {
  date: Date;
  dateStr: string;
  description: string;
  amount: number;
  type: "EXPENSE" | "INCOME" | "SAVINGS";
  accountName?: string;
  rawRow: Record<string, any>;
  rowIndex: number;
}

export interface ParseRowError {
  rowIndex: number;
  rawRow: Record<string, any>;
  reason: string;
}

export interface StatementParseResult {
  validRows: ParsedTransactionRow[];
  errors: ParseRowError[];
  totalRowsProcessed: number;
  detectedFormat: "SINGLE_AMOUNT" | "DEBIT_CREDIT_COLUMNS" | "EXTENDED_STATEMENT" | "UNKNOWN";
}

/**
 * Robust date parser supporting Indian, European, US, and Textual date formats
 */
export function parseFlexibleDate(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date && isValid(dateInput)) return dateInput;

  const rawStr = String(dateInput).trim();
  if (!rawStr) return null;

  // Standard ISO Date parse
  const directDate = new Date(rawStr);
  if (isValid(directDate) && !isNaN(directDate.getTime()) && rawStr.includes("-") && rawStr.length >= 8) {
    // Avoid timezone offset bugs by parsing YYYY-MM-DD explicitly
    const parts = rawStr.split("T")[0].split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }

  // Known formats to try sequentially
  const dateFormats = [
    "dd/MM/yyyy",
    "dd-MM-yyyy",
    "dd.MM.yyyy",
    "dd/MM/yy",
    "dd-MM-yy",
    "yyyy-MM-dd",
    "yyyy/MM/dd",
    "MM/dd/yyyy",
    "MM-dd-yyyy",
    "dd-MMM-yyyy",
    "dd MMM yyyy",
    "MMM dd, yyyy",
    "dd-MMM-yy",
  ];

  for (const fmt of dateFormats) {
    try {
      const parsed = parse(rawStr, fmt, new Date());
      if (isValid(parsed) && !isNaN(parsed.getTime()) && parsed.getFullYear() > 1990 && parsed.getFullYear() < 2100) {
        return parsed;
      }
    } catch {
      // Continue to next format
    }
  }

  return null;
}

/**
 * Normalizes numerical amount string with support for currency symbols, commas, and Cr/Dr suffixes
 */
export function parseAmountString(value: any): { amount: number; isNegative: boolean } | null {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    if (isNaN(value) || value === 0) return null;
    return { amount: Math.abs(value), isNegative: value < 0 };
  }

  let str = String(value).trim();
  if (!str) return null;

  // Detect Dr / Cr suffixes common in Indian bank statements (HDFC, SBI, ICICI)
  let isNegative = false;
  if (/(\bDr\b|\bDebit\b|-)/i.test(str)) {
    isNegative = true;
  }
  if (/(\bCr\b|\bCredit\b|\+)/i.test(str)) {
    isNegative = false;
  }

  // Strip non-numeric characters except decimals and minus
  const cleaned = str.replace(/[₹\$,\s]|(?:Dr|Cr|Debit|Credit)/gi, "").trim();
  const parsedNum = parseFloat(cleaned);

  if (isNaN(parsedNum) || parsedNum === 0) {
    return null;
  }

  return {
    amount: Math.abs(parsedNum),
    isNegative: isNegative || parsedNum < 0,
  };
}

/**
 * Universal Multi-Bank Statement CSV Parser
 */
export function parseBankStatementCSV(rawData: Record<string, any>[]): StatementParseResult {
  const validRows: ParsedTransactionRow[] = [];
  const errors: ParseRowError[] = [];

  if (!rawData || rawData.length === 0) {
    return {
      validRows: [],
      errors: [{ rowIndex: 1, rawRow: {}, reason: "CSV file is empty." }],
      totalRowsProcessed: 0,
      detectedFormat: "UNKNOWN",
    };
  }

  // 1. Detect Column Names
  const firstRow = rawData[0];
  const keys = Object.keys(firstRow);

  // Date column detection
  const dateKey = keys.find((k) => /date|txn_date|transaction_date|value_date|posting_date/i.test(k.trim()));

  // Description / Narration detection
  const descKey = keys.find((k) =>
    /description|narration|particulars|remarks|payee|merchant|memo|details|name/i.test(k.trim())
  );

  // Single amount vs Two-column Debit/Credit detection
  const singleAmtKey = keys.find((k) => /^amount$|^total$|^txn_amount$/i.test(k.trim()));
  const debitKey = keys.find((k) => /debit|withdrawal|dr_amount|paid_out/i.test(k.trim()));
  const creditKey = keys.find((k) => /credit|deposit|cr_amount|paid_in/i.test(k.trim()));
  const accountKey = keys.find((k) => /account|account_name|card|source/i.test(k.trim()));

  let detectedFormat: StatementParseResult["detectedFormat"] = "UNKNOWN";
  if (debitKey && creditKey) {
    detectedFormat = "DEBIT_CREDIT_COLUMNS";
  } else if (singleAmtKey) {
    detectedFormat = "SINGLE_AMOUNT";
  } else {
    // Fallback search
    const anyAmt = keys.find((k) => /amount/i.test(k));
    if (anyAmt) detectedFormat = "SINGLE_AMOUNT";
  }

  // 2. Row by row processing
  rawData.forEach((row, index) => {
    const rowNum = index + 1;

    // Check Description
    const rawDesc = descKey ? row[descKey] : null;
    if (!rawDesc || typeof rawDesc !== "string" || !rawDesc.trim()) {
      errors.push({
        rowIndex: rowNum,
        rawRow: row,
        reason: `Missing merchant or transaction description in row ${rowNum}.`,
      });
      return;
    }

    // Check Date
    const rawDateVal = dateKey ? row[dateKey] : null;
    const parsedDate = parseFlexibleDate(rawDateVal);
    if (!parsedDate) {
      errors.push({
        rowIndex: rowNum,
        rawRow: row,
        reason: `Invalid or unparseable date "${rawDateVal || "Empty"}" in row ${rowNum}.`,
      });
      return;
    }

    // Check Amount
    let finalAmount = 0;
    let finalType: "EXPENSE" | "INCOME" | "SAVINGS" = "EXPENSE";
    let hasValidAmount = false;

    if (debitKey && creditKey) {
      const debitParsed = parseAmountString(row[debitKey]);
      const creditParsed = parseAmountString(row[creditKey]);

      if (debitParsed && debitParsed.amount > 0) {
        finalAmount = debitParsed.amount;
        finalType = "EXPENSE";
        hasValidAmount = true;
      } else if (creditParsed && creditParsed.amount > 0) {
        finalAmount = creditParsed.amount;
        finalType = "INCOME";
        hasValidAmount = true;
      }
    } else if (singleAmtKey || debitKey || creditKey) {
      const targetKey = singleAmtKey || debitKey || creditKey;
      const amtParsed = parseAmountString(row[targetKey!]);
      if (amtParsed && amtParsed.amount > 0) {
        finalAmount = amtParsed.amount;
        finalType = amtParsed.isNegative ? "EXPENSE" : "INCOME";
        hasValidAmount = true;
      }
    }

    if (!hasValidAmount) {
      errors.push({
        rowIndex: rowNum,
        rawRow: row,
        reason: `Zero or invalid amount value in row ${rowNum}.`,
      });
      return;
    }

    const accountName = accountKey && row[accountKey] ? String(row[accountKey]).trim() : undefined;

    validRows.push({
      date: parsedDate,
      dateStr: parsedDate.toISOString().split("T")[0],
      description: rawDesc.trim(),
      amount: finalAmount,
      type: finalType,
      accountName,
      rawRow: row,
      rowIndex: rowNum,
    });
  });

  return {
    validRows,
    errors,
    totalRowsProcessed: rawData.length,
    detectedFormat,
  };
}
