// One source of truth for prices, promo rules, cart validation and the shipping
// rate tables. Pure module: no React, no DOM, no env, no imports. It is used by
// the cart (src/lib/cart.tsx) and by the Pages Functions
// (functions/api/create-payment-intent.ts, functions/_shared/shipping.ts), so the
// total the shopper sees is computed by the same code that sets the charge.
// All money is integer cents.

export type PromoTier = "standard" | "pack";
export type ShippingType = "fedex" | "usps";

export interface PriceEntry {
  /** list price, cents */
  price: number;
  /** extras discount tier under the promo code */
  promoTier: PromoTier;
  /** carrier class: large stands ship FedEx, everything else USPS */
  shippingType: ShippingType;
  /** flat price with the promo code, cents; replaces the tier discount */
  promoPrice?: number;
}

export const PROMO_CODE = "PLATOS#1";

/** Stands cost this flat amount (cents) with PROMO_CODE. Does not expire. */
export const STAND_PROMO_PRICE = 35000;

export const PRICE_TABLE: Record<string, PriceEntry> = {
  "sb-1000": { price: 49500, promoTier: "standard", shippingType: "fedex", promoPrice: STAND_PROMO_PRICE },
  "bb-2000": { price: 48950, promoTier: "standard", shippingType: "fedex", promoPrice: STAND_PROMO_PRICE },
  "pc-plate": { price: 4500, promoTier: "standard", shippingType: "usps" },
  "sb-pk": { price: 4850, promoTier: "pack", shippingType: "usps" },
  "bb-pk": { price: 4250, promoTier: "pack", shippingType: "usps" },
  "bb-complete": { price: 5000, promoTier: "pack", shippingType: "usps" },
  "sb-complete": { price: 5350, promoTier: "pack", shippingType: "usps" },
};

/** Tier discount for extras under the promo code. */
export const PROMO_DISCOUNTS: Record<PromoTier, number> = {
  standard: 0.1, // pc-plate
  pack: 0.2, // cable and complete packs
};

export const MAX_QTY_PER_ITEM = 20;

/** Sanity ceiling for one FedEx stand box (cents). A live rate above this per box is rejected. */
export const FEDEX_MAX_PER_BOX = 25000;

/** Number of FedEx boxes in a cart: each stand ships as its own box. */
export function standBoxCount(items: LineItem[]): number {
  return items.reduce((sum, i) => sum + (isLargeItem(i.id) ? i.qty : 0), 0);
}

// ---- destination validation -------------------------------------------------

/** First ZIP digits the USPS assigns to each state (50 states + DC). Territories are out of scope. */
const STATE_ZIP_FIRST_DIGITS: Record<string, string> = {
  CT: "0", MA: "0", ME: "0", NH: "0", NJ: "0", RI: "0", VT: "0",
  DE: "1", PA: "1",
  NY: "01", // Holtsville / Fishers Island ZIPs begin with 0
  DC: "2", MD: "2", NC: "2", SC: "2", VA: "2", WV: "2",
  AL: "3", FL: "3", GA: "3", MS: "3", TN: "3",
  IN: "4", KY: "4", MI: "4", OH: "4",
  IA: "5", MN: "5", MT: "5", ND: "5", SD: "5", WI: "5",
  IL: "6", KS: "6", MO: "6", NE: "6",
  AR: "7", LA: "7", OK: "7",
  TX: "78", // El Paso ZIPs begin with 8
  AZ: "8", CO: "8", ID: "8", NM: "8", NV: "8", UT: "8", WY: "8",
  AK: "9", CA: "9", HI: "9", OR: "9", WA: "9",
};

export const US_STATE_CODES: string[] = Object.keys(STATE_ZIP_FIRST_DIGITS);

export function isValidZip(zip: unknown): zip is string {
  return typeof zip === "string" && /^\d{5}(-\d{4})?$/.test(zip.trim());
}

export function isValidStateCode(state: unknown): state is string {
  return typeof state === "string" && Object.prototype.hasOwnProperty.call(STATE_ZIP_FIRST_DIGITS, state.trim().toUpperCase());
}

/** True when the ZIP's first digit is one the USPS assigns to the state. */
export function zipMatchesState(zip: string, state: string): boolean {
  const digits = STATE_ZIP_FIRST_DIGITS[state.trim().toUpperCase()];
  const first = zip.trim().charAt(0);
  return digits !== undefined && first !== "" && digits.includes(first);
}

export type DestinationResult =
  | { ok: true; zip: string; state: string }
  | { ok: false; error: string };

/** Validate and normalise a shipping destination from an untrusted request. */
export function validateDestination(zip: unknown, state: unknown): DestinationResult {
  if (!isValidStateCode(state)) return { ok: false, error: "Please choose a valid state." };
  if (!isValidZip(zip)) return { ok: false, error: "Please enter a valid 5-digit ZIP code." };
  const s = state.trim().toUpperCase();
  const z = zip.trim();
  if (!zipMatchesState(z, s)) return { ok: false, error: "That ZIP code does not match the state you chose." };
  return { ok: true, zip: z, state: s };
}

/** USPS Flat Rate box prices (cents), updated annually in January. */
export const USPS_RATES = {
  small: 1040,
  medium: 1610,
  large: 2290,
};

/** Fallback FedEx Ground Home rate by destination state (cents), from Pomona, CA. */
export function fedexFallbackRate(destinationState: string): number {
  const state = String(destinationState || "").toUpperCase();
  const westCoast = new Set(["CA", "OR", "WA", "NV", "AZ"]);
  const mountain = new Set(["CO", "UT", "NM", "MT", "WY", "ID"]);
  const central = new Set([
    "TX", "OK", "KS", "NE", "MO", "IL", "MN", "IA", "WI",
    "ND", "SD", "AR", "LA", "MS", "AL", "TN",
  ]);
  if (westCoast.has(state)) return 8000;
  if (mountain.has(state)) return 10000;
  if (central.has(state)) return 12500;
  if (state === "AK" || state === "HI") return 17500;
  return 15000; // East Coast / default
}

export interface LineItem {
  id: string;
  qty: number;
}

export function isKnownProduct(id: unknown): id is string {
  return typeof id === "string" && Object.prototype.hasOwnProperty.call(PRICE_TABLE, id);
}

export function isLargeItem(id: string): boolean {
  return PRICE_TABLE[id]?.shippingType === "fedex";
}

/** Case-insensitive, surrounding spaces ignored; only PROMO_CODE is valid. Accepts any input. */
export function isValidPromoCode(code: unknown): boolean {
  return typeof code === "string" && code.trim().toUpperCase() === PROMO_CODE;
}

export type ItemsResult =
  | { ok: true; items: LineItem[] }
  | { ok: false; error: string };

/**
 * Validate a cart from an untrusted request. Rejects non-arrays, unknown ids,
 * and any qty that is not an integer 1..MAX_QTY_PER_ITEM. Duplicate ids are
 * merged (the merged qty must still be 1..MAX_QTY_PER_ITEM).
 */
export function validateItems(raw: unknown): ItemsResult {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "Cart is empty" };
  }
  const merged = new Map<string, number>();
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, error: "Invalid cart item" };
    }
    const { id, qty } = entry as { id?: unknown; qty?: unknown };
    if (!isKnownProduct(id)) {
      return { ok: false, error: `Unknown product: ${String(id)}` };
    }
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY_PER_ITEM) {
      return { ok: false, error: `Invalid quantity for ${id}` };
    }
    const next = (merged.get(id) ?? 0) + qty;
    if (next > MAX_QTY_PER_ITEM) {
      return { ok: false, error: `Invalid quantity for ${id}` };
    }
    merged.set(id, next);
  }
  return { ok: true, items: [...merged].map(([id, qty]) => ({ id, qty })) };
}

/** Price of one unit of a product (cents) under the given promo state. */
export function unitPrice(id: string, promoApplied: boolean): number {
  const entry = PRICE_TABLE[id];
  if (!promoApplied) return entry.price;
  if (entry.promoPrice !== undefined) return Math.min(entry.price, entry.promoPrice);
  return entry.price - Math.round(entry.price * PROMO_DISCOUNTS[entry.promoTier]);
}

export interface CartTotals {
  subtotal: number; // list prices, cents
  discount: number; // cents taken off by the promo
  shipping: number; // cents
  total: number; // subtotal - discount + shipping
}

/**
 * The one price function. `items` must already be valid (see validateItems);
 * `shipping` is the shipping amount in cents. Discount is computed per unit then
 * multiplied, so it is always an integer number of cents.
 */
export function priceCart(items: LineItem[], promoCode: unknown, shipping: number): CartTotals {
  const promoApplied = isValidPromoCode(promoCode);
  let subtotal = 0;
  let discount = 0;
  for (const { id, qty } of items) {
    const list = PRICE_TABLE[id].price;
    subtotal += list * qty;
    discount += (list - unitPrice(id, promoApplied)) * qty;
  }
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}
