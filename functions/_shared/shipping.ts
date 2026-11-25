// Shared server-side shipping quote, used by api/calculate-shipping (what the
// shopper sees) and api/create-payment-intent (what is charged). This file
// exports no route handler, so Pages creates no route for it.
import {
  FEDEX_MAX_PER_BOX,
  USPS_RATES,
  fedexFallbackRate,
  standBoxCount,
  isLargeItem,
  type LineItem,
} from "../../shared/pricing.ts";

export interface ShippingEnv {
  FEDEX_CLIENT_ID?: string;
  FEDEX_CLIENT_SECRET?: string;
  FEDEX_ACCOUNT_NUMBER?: string;
  FEDEX_SANDBOX?: string; // "true" to use sandbox URL
}

export interface ShippingQuote {
  total: number; // cents
  breakdown: { carrier: string; rate: number; label: string }[];
}

// Ship-from: Platos Pro LLC Manufacturing, Pomona, CA 91766
const ORIGIN_ZIP = "91766";

// One stand = one FedEx box (Jesse, 2026-11-25).
const BOX = {
  weight: { units: "LB", value: 32.5 },
  dimensions: { length: 52, width: 14, height: 14, units: "IN" },
};

/** Live FedEx quotes are remembered this long so the quote the shopper saw is the one charged. */
export const QUOTE_CACHE_TTL_SECONDS = 1800;

function fedexBaseUrl(env: ShippingEnv): string {
  return env.FEDEX_SANDBOX === "true"
    ? "https://apis-sandbox.fedex.com"
    : "https://apis.fedex.com";
}

async function getFedExToken(env: ShippingEnv): Promise<string | null> {
  if (!env.FEDEX_CLIENT_ID || !env.FEDEX_CLIENT_SECRET) return null;

  try {
    const res = await fetch(`${fedexBaseUrl(env)}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: env.FEDEX_CLIENT_ID,
        client_secret: env.FEDEX_CLIENT_SECRET,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json() as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

/** FedEx Ground Home rate in cents for `boxes` identical stand boxes, or null. */
async function getFedExRate(env: ShippingEnv, destinationZip: string, boxes: number): Promise<number | null> {
  const token = await getFedExToken(env);
  if (!token) return null;

  try {
    const res = await fetch(`${fedexBaseUrl(env)}/rate/v1/rates/quotes`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accountNumber: { value: env.FEDEX_ACCOUNT_NUMBER },
        requestedShipment: {
          shipper: { address: { postalCode: ORIGIN_ZIP, countryCode: "US" } },
          recipient: { address: { postalCode: destinationZip, countryCode: "US", residential: true } },
          pickupType: "DROPOFF_AT_FEDEX_LOCATION",
          rateRequestType: ["ACCOUNT"],
          requestedPackageLineItems: [{ groupPackageCount: boxes, ...BOX }],
          serviceType: "GROUND_HOME_DELIVERY",
        },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json() as {
      output?: {
        rateReplyDetails?: Array<{
          ratedShipmentDetails?: Array<{ totalNetCharge?: number }>;
        }>;
      };
    };

    const charge = data?.output?.rateReplyDetails?.[0]?.ratedShipmentDetails?.[0]?.totalNetCharge;
    if (typeof charge !== "number" || !Number.isFinite(charge) || charge <= 0) return null;
    const cents = Math.round(charge * 100); // dollars to cents
    // Sanity ceiling: an absurd live rate is treated as a FedEx failure.
    return cents <= FEDEX_MAX_PER_BOX * boxes ? cents : null;
  } catch {
    return null;
  }
}

// ---- quote cache (Workers Cache API) ---------------------------------------
// Only live FedEx quotes are cached. Fallback estimates are not, so a FedEx
// blip never pins an estimate. If the Cache API is unavailable or throws, the
// quote is simply computed live.

interface CachedFedEx {
  rate: number;
}

function cacheStore(): { match(r: Request): Promise<Response | undefined>; put(r: Request, res: Response): Promise<void> } | null {
  const c = (globalThis as { caches?: { default?: unknown } }).caches;
  return (c?.default as ReturnType<typeof cacheStore>) ?? null;
}

function quoteCacheRequest(items: LineItem[], zip: string, state: string): Request {
  const itemKey = [...items]
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((i) => `${i.id}x${i.qty}`)
    .join(",");
  const url = `https://shipping-quote.internal/v1/fedex?zip=${zip.slice(0, 5)}&state=${state.toUpperCase()}&items=${encodeURIComponent(itemKey)}`;
  return new Request(url, { method: "GET" });
}

async function cacheRead(key: Request, boxes: number): Promise<number | null> {
  try {
    const store = cacheStore();
    if (!store) return null;
    const hit = await store.match(key);
    if (!hit) return null;
    const data = await hit.json() as Partial<CachedFedEx>;
    const rate = data.rate;
    return typeof rate === "number" && Number.isFinite(rate) && rate > 0 && rate <= FEDEX_MAX_PER_BOX * boxes ? rate : null;
  } catch {
    return null;
  }
}

async function cacheWrite(key: Request, rate: number): Promise<void> {
  try {
    const store = cacheStore();
    if (!store) return;
    await store.put(
      key,
      new Response(JSON.stringify({ rate } satisfies CachedFedEx), {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": `public, max-age=${QUOTE_CACHE_TTL_SECONDS}`,
        },
      }),
    );
  } catch {
    // caching is best effort
  }
}

/**
 * Shipping for a validated cart to a validated destination. Each stand ships as
 * its own FedEx Ground Home box (live rate for all boxes, zone fallback times
 * the box count when FedEx is unavailable). Any other item adds one USPS Medium
 * Flat Rate box. Both routes call this, so they can never disagree; live FedEx
 * quotes are cached for QUOTE_CACHE_TTL_SECONDS so a FedEx blip between the quote
 * and the payment cannot change the number the shopper saw.
 */
export async function quoteShipping(
  env: ShippingEnv,
  items: LineItem[],
  destination: { zip: string; state: string },
): Promise<ShippingQuote> {
  const boxes = standBoxCount(items);
  const hasSmall = items.some((i) => !isLargeItem(i.id));

  let total = 0;
  const breakdown: ShippingQuote["breakdown"] = [];

  if (boxes > 0) {
    const key = quoteCacheRequest(items, destination.zip, destination.state);
    let rate = await cacheRead(key, boxes);
    let live = rate !== null;
    if (rate === null) {
      rate = await getFedExRate(env, destination.zip.slice(0, 5), boxes);
      live = rate !== null;
      if (rate !== null) await cacheWrite(key, rate);
    }
    const finalRate = rate ?? fedexFallbackRate(destination.state) * boxes;
    total += finalRate;
    breakdown.push({
      carrier: "FedEx Home Delivery",
      rate: finalRate,
      label: live ? `Real-time rate (${boxes} ${boxes === 1 ? "box" : "boxes"})` : `Estimated rate (${boxes} ${boxes === 1 ? "box" : "boxes"})`,
    });
  }

  if (hasSmall) {
    total += USPS_RATES.medium;
    breakdown.push({
      carrier: "USPS Flat Rate",
      rate: USPS_RATES.medium,
      label: "Medium Flat Rate Box",
    });
  }

  return { total, breakdown };
}
