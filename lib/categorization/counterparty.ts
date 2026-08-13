export interface GroupedCounterparty {
  counterpartyKey: string;
  transactionCount: number;
  totalAmount: number;
  typicalAmount: number;
  sampleNarration: string;
  rawNarrations: string[];
  amounts: number[];
  dates?: string[];
}

/**
 * Extracts a clean, normalized canonical counterparty key from noisy raw bank narrations,
 * stripping reference numbers, bank identifiers, VPA/QR tails, transaction codes, and transaction descriptors.
 */
export function extractCounterpartyKey(rawDesc: string): string {
  if (!rawDesc || typeof rawDesc !== "string") return "Unknown Counterparty";

  let str = rawDesc.trim();

  // 1. Format: Hyphen/Slash ACH / NEFT / IMPS prefixes (e.g. "ACH DR-NETFLIX ENTERTAINMENT-140826")
  str = str.replace(/^ACH\s*(?:DR|CR)?[\s\-_]*/i, "");
  str = str.replace(/^POS\s*\d*\s*/i, "");
  str = str.replace(/^ECOM\s*(?:PUR)?[\s\/\-_]*/i, "");

  // 2. Format: UPI / slash-delimited patterns
  // e.g. "UPI/DR/622450640912/MUKESH S/YESB/paytm.s22m/UPI"
  // e.g. "UPI/CR/609165199967/Shashwat/JIOP/87997"
  // e.g. "IMPS/P2A/622450640912/PRESTIGE APARTMENTS/HDFC"
  if (str.includes("/")) {
    const segments = str.split("/").map((s) => s.trim()).filter(Boolean);

    const candidateSegments = segments.filter((seg) => {
      const lower = seg.toLowerCase();
      // Skip protocol markers
      if (/^(upi|dr|cr|p2a|p2p|nach|ecs|imps|neft|rtgs|pos|ach|inb|mb|atm|chq|ref|txn|bil|ecom|rev)$/i.test(seg)) return false;
      // Skip numeric reference numbers (> 3 digits)
      if (/^\d{4,}$/.test(seg)) return false;
      // Skip VPA handles and payment app IDs
      if (lower.includes("@") || lower.startsWith("paytm.") || lower.startsWith("ok") || lower.startsWith("ybl") || lower.startsWith("apl") || /^\d+$/.test(seg)) return false;
      // Skip bank IFSC/identifier codes
      if (/^(yesb|hdfc|icic|sbin|sbin\w*|utib|barb|punb|cnrb|ioba|idib|mahb|axis|kbl|rbl|kotak|paytm)$/i.test(seg)) return false;
      return true;
    });

    if (candidateSegments.length > 0) {
      str = candidateSegments[0];
    }
  }

  // 3. Format: Hyphen delimited transfers (e.g. "NEFT-INF12345678-INFOSYS TECH CORP-SALARY")
  if (str.includes("-")) {
    const parts = str.split("-").map((p) => p.trim()).filter(Boolean);
    const nonNoise = parts.filter((p) => {
      if (/^(neft|imps|ach|upi|dr|cr|salary|payment|payout|transfer)$/i.test(p)) return false;
      if (/^[a-zA-Z]{3,4}\d{4,}$/.test(p) || /^\d{4,}$/.test(p)) return false;
      return true;
    });
    if (nonNoise.length > 0) {
      str = nonNoise[0];
    }
  }

  // 4. Strip specific merchant noise, transaction descriptors, dates, and card tags
  let cleaned = str
    // Strip common banking and POS prefixes
    .replace(/\b(?:UPI|IMPS|NEFT|RTGS|POS|ACH|ATM|INF|CHQ|REF|TXN|ECS|NACH|BIL|INB|MB|VPA|ECOM PUR|PURCHASE|BILLPAY|DIRECT DEP|DIRECT DEPOSIT|TRANSFER TO|TRANSFER FROM)\b/gi, "")
    // Strip VPA handles and emails
    .replace(/[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+/gi, "")
    // Strip order / ticket numbers (e.g. #9921, ORDER 9921, TXN12345)
    .replace(/#?\bORDER\s*#?\d+\b/gi, "")
    .replace(/#?\b\d{4,}\b/g, "")
    .replace(/XX\d{4}/gi, "")
    .replace(/\b\d{2}[\/\-]\d{2}[\/\-]\d{2,4}\b/g, "")
    // Strip web domains
    .replace(/(?:www\.)?[a-zA-Z0-9-]+\.(?:com|in|org|net|co|io)\b/gi, "")
    // Strip major Indian city tokens commonly appended by POS/terminals
    .replace(/\b(?:BANGALORE|BENGALURU|MUMBAI|DELHI|NEW DELHI|HYDERABAD|CHENNAI|PUNE|KOLKATA|NOIDA|GURGAON|GURUGRAM|AHMEDABAD|JAIPUR|INDIA|IN)\b/gi, "")
    // Strip generic transactional noise suffixes
    .replace(/\b(?:MONTHLY RENT TRANSFER|DIRECT SALARY CREDIT|MONTHLY 4K STREAMING|MONTHLY 4K|SALARY CREDIT|RENT TRANSFER|BILL PAYMENT|HIGH SPEED|FAST DELIVERY|EXPRESS DELIVERY|RESTAURANT DINING|ONLINE STORE|SIP AUTO-DEPOSIT|AUTO-DEPOSIT|ENTERTAINMENT|TECH CORP|GROCERIES EXPRESS|EXPRESS|DELIVERY)\b/gi, "")
    .replace(/\b(?:ORDER|TRANSFER|SALARY|PAYMENT|BILL|PURCHASE|CREDIT|DEBIT|STREAMING)\b/gi, "")


    // Strip non-alphanumeric noise
    .replace(/[^a-zA-Z0-9\s&'-]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!cleaned || cleaned.length < 2) {
    cleaned = rawDesc.trim().slice(0, 30);
  }

  // 5. Normalize casing & whitespace to canonical Title Case
  const words = cleaned
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .slice(0, 3) // canonical 1-3 words
    .map((w) => {
      // Keep short uppercase acronyms like "HDFC", "SBI", "PVR", "SIP" intact
      if (w.length <= 4 && /^[A-Z]+$/.test(w) && !/^(THE|AND|FOR|OUT|PAY|DR|CR)$/i.test(w)) {
        return w;
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });

  return words.join(" ") || "Unknown Counterparty";
}

/**
 * Groups an array of transactions by their normalized counterparty key.
 * Collapses repeat visits, different QR codes, and varied bank reference strings into a single entity.
 */
export function groupTransactionsByCounterparty(
  transactions: Array<{ description: string; amount: number; date?: string | Date }>
): GroupedCounterparty[] {
  const groupsMap = new Map<string, GroupedCounterparty>();

  transactions.forEach((tx) => {
    const rawDesc = tx.description || "Unknown Transaction";
    const amt = Math.abs(tx.amount || 0);
    const key = extractCounterpartyKey(rawDesc);
    const dateStr = tx.date ? new Date(tx.date).toISOString().split("T")[0] : undefined;

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        counterpartyKey: key,
        transactionCount: 0,
        totalAmount: 0,
        typicalAmount: 0,
        sampleNarration: rawDesc,
        rawNarrations: [],
        amounts: [],
        dates: [],
      });
    }

    const group = groupsMap.get(key)!;
    group.transactionCount++;
    group.totalAmount += amt;
    group.amounts.push(amt);
    if (dateStr) group.dates!.push(dateStr);
    if (!group.rawNarrations.includes(rawDesc)) {
      group.rawNarrations.push(rawDesc);
    }
  });

  // Calculate typical (average) amount for each counterparty group
  const result = Array.from(groupsMap.values()).map((g) => {
    const avg = g.totalAmount / (g.transactionCount || 1);
    return {
      ...g,
      totalAmount: Math.round(g.totalAmount * 100) / 100,
      typicalAmount: Math.round(avg * 100) / 100,
    };
  });

  // Sort by transaction count descending (highest frequency counterparties first)
  return result.sort((a, b) => b.transactionCount - a.transactionCount);
}
