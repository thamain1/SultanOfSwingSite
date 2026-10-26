// Pricing lives apart from the product catalog so the public shop can show
// products without shipping any prices. Only the dormant checkout
// (src/checkout/) imports this file; while online ordering is off, nothing
// on the live site does, so none of these numbers reach the bundle.
// Server-side source of truth: functions/api/create-payment-intent.ts.

// Product prices (cents), keyed by product id — must match the server table
export const PRICES: Record<string, number> = {
  "sb-1000": 49500,
  "bb-2000": 48950,
  "pc-plate": 4500,
  "sb-pk": 4850,
  "bb-pk": 4250,
  "bb-complete": 5000,
  "sb-complete": 5350,
};

export const PROMO_DISCOUNTS = {
  standard: 0.10, // 10% off main items + plate
  pack: 0.20,     // 20% off cable/complete packs
};

export const PROMO_CODES: Record<string, { label: string }> = {
  "PLATOS#1": { label: "Tournament Pricing" },
};

// USPS Flat Rate box prices (cents) — updated annually in January
export const USPS_FLAT_RATES = {
  small: 1040,
  medium: 1610,
  large: 2290,
};

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
