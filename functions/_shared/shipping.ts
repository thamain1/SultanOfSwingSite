// Shared server-side shipping quote, used by api/calculate-shipping (what the
// shopper sees) and api/create-payment-intent (what is charged). This file
// exports no route handler, so Pages creates no route for it.
import { USPS_RATES, fedexFallbackRate, isLargeItem, type LineItem } from "../../shared/pricing.ts";

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

async function getFedExRate(env: ShippingEnv, destinationZip: string): Promise<number | null> {
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
          requestedPackageLineItems: [{
            weight: { units: "LB", value: 32.5 },
            dimensions: { length: 52, width: 14, height: 14, units: "IN" },
          }],
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
    if (typeof charge === "number") {
      return Math.round(charge * 100); // dollars to cents
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Shipping for a validated cart. Large stands: FedEx Ground Home (live rate,
 * zone fallback by state when FedEx is unavailable). Any other item: USPS
 * Medium Flat Rate. Both routes call this, so they can never disagree.
 */
export async function quoteShipping(
  env: ShippingEnv,
  items: LineItem[],
  destination: { zip: string; state: string },
): Promise<ShippingQuote> {
  const hasLarge = items.some((i) => isLargeItem(i.id));
  const hasSmall = items.some((i) => !isLargeItem(i.id));

  let total = 0;
  const breakdown: ShippingQuote["breakdown"] = [];

  if (hasLarge) {
    const fedexRate = await getFedExRate(env, destination.zip);
    const rate = fedexRate ?? fedexFallbackRate(destination.state);
    total += rate;
    breakdown.push({
      carrier: "FedEx Home Delivery",
      rate,
      label: fedexRate !== null ? "Real-time rate" : "Estimated rate",
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
