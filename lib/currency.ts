export const CURRENCY_SYMBOL = "₹";
export const CURRENCY_CODE = "INR";

/**
 * Formats a numeric value into INR currency string (e.g. ₹1,25,000 or ₹1,25,000.50)
 */
export function formatINR(
  amount: number,
  options?: {
    decimals?: number;
    compact?: boolean;
    showSign?: boolean;
  }
): string {
  const decimals = options?.decimals !== undefined ? options.decimals : 0;
  const showSign = options?.showSign ?? false;

  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${CURRENCY_SYMBOL}0`;
  }

  const absAmt = Math.abs(amount);
  let formatted = absAmt.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (options?.compact) {
    if (absAmt >= 10000000) {
      formatted = `${(absAmt / 10000000).toFixed(1)} Cr`;
    } else if (absAmt >= 100000) {
      formatted = `${(absAmt / 100000).toFixed(1)} L`;
    } else if (absAmt >= 1000) {
      formatted = `${(absAmt / 1000).toFixed(1)} k`;
    }
  }

  const sign = amount < 0 ? "-" : showSign && amount > 0 ? "+" : "";
  return `${sign}${CURRENCY_SYMBOL}${formatted}`;
}

export default formatINR;
