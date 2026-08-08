/** Platform is USD-only. Do not introduce other currencies in UI or payloads. */
export const PLATFORM_CURRENCY = "USD";

/**
 * Format a money amount for display. Always USD.
 * @param {number|string|null|undefined} amount
 * @param {{ compact?: boolean }} [opts]
 */
export function formatMoney(amount, opts = {}) {
  const n = Number(amount);
  const value = Number.isFinite(n) ? n : 0;
  if (opts.compact) {
    return `$${Math.round(value).toLocaleString("en-US")}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: PLATFORM_CURRENCY,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

/** Short label next to prices (RTL/LTR). Always USD. */
export function currencyLabel(_isRtl = false) {
  return "USD";
}

/** Normalize any API currency field to the platform currency. */
export function resolveCurrency(_value) {
  return PLATFORM_CURRENCY;
}
