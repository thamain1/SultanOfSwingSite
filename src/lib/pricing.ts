// Client-side pricing helpers. Prices, promo rules and the cart math live in
// shared/pricing.ts, the same module the Pages Functions use to set the charge,
// so the total shown here is computed by the code that decides what is billed.
export {
  MAX_QTY_PER_ITEM,
  PRICE_TABLE,
  PROMO_CODE,
  STAND_PROMO_PRICE,
  USPS_RATES,
  isLargeItem,
  isValidPromoCode,
  priceCart,
  unitPrice,
} from "../../shared/pricing.ts";

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Whole-dollar form for marketing copy ("$350"), only used for round amounts.
export function formatDollars(cents: number): string {
  return `$${Math.round(cents / 100)}`;
}
