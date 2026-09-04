export const USD_TO_FRW_RATE = 1450;

/**
 * Formats a USD price into dual currency display: USD ($) and converted FRW.
 * Examples:
 *   formatPrice(25) => "$25.00 (36,250 FRW)"
 *   formatPrice(25, true) => "$25.00 · 36,250 FRW"
 */
export function formatPrice(priceUSD: number | string | undefined | null, compact: boolean = false): string {
  if (priceUSD === undefined || priceUSD === null || priceUSD === '') {
    return '$0.00 (0 FRW)';
  }

  let numericVal: number;
  if (typeof priceUSD === 'number') {
    numericVal = priceUSD;
  } else {
    const cleaned = String(priceUSD).replace(/[^0-9.]/g, '');
    numericVal = parseFloat(cleaned) || 0;
  }

  const usdFormatted = `$${numericVal.toFixed(2)}`;
  const frwVal = Math.round(numericVal * USD_TO_FRW_RATE).toLocaleString('en-US');

  if (compact) {
    return `${usdFormatted} · ${frwVal} FRW`;
  }
  return `${usdFormatted} (${frwVal} FRW)`;
}

export function convertUSDToFRW(priceUSD: number | string): string {
  const numericVal = typeof priceUSD === 'number' ? priceUSD : parseFloat(String(priceUSD).replace(/[^0-9.]/g, '')) || 0;
  const frwVal = Math.round(numericVal * USD_TO_FRW_RATE).toLocaleString('en-US');
  return `${frwVal} FRW`;
}
