interface Env {
  FEDEX_CLIENT_ID?: string;
  FEDEX_CLIENT_SECRET?: string;
  FEDEX_ACCOUNT_NUMBER?: string;
  FEDEX_SANDBOX?: string; // "true" to use sandbox URL
}

interface ShipRequest {
  items: { id: string; qty: number }[];
  destination: { zip: string; state: string };
}

// USPS Flat Rate prices (cents) — updated annually in January
const USPS_RATES = {
  small: 1040,
  medium: 1610,
  large: 2290,
};

const LARGE_ITEMS = new Set(["sb-1000", "bb-2000"]);

// Ship-from: Platos Pro LLC Manufacturing, Pomona, CA 91766
const ORIGIN_ZIP = "91766";

function fedexBaseUrl(env: Env): string {
  return env.FEDEX_SANDBOX === "true"
    ? "https://apis-sandbox.fedex.com"
    : "https://apis.fedex.com";
}

async function getFedExToken(env: Env): Promise<string | null> {
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

async function getFedExRate(
  env: Env,
  destinationZip: string,
): Promise<number | null> {
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
          ratedShipmentDetails?: Array<{
            totalNetCharge?: number;
          }>;
        }>;
      };
    };

    const charge = data?.output?.rateReplyDetails?.[0]?.ratedShipmentDetails?.[0]?.totalNetCharge;
    if (typeof charge === "number") {
      return Math.round(charge * 100); // convert dollars to cents
    }

    return null;
  } catch {
    return null;
  }
}

// Fallback zone-based rates from Pomona, CA (cents)
// Based on FedEx Ground dimensional weight: 74 lbs (52x14x14 / 139)
function getFedExFallbackRate(destinationState: string): number {
  const westCoast = new Set(["CA", "OR", "WA", "NV", "AZ"]);
  const mountain = new Set(["CO", "UT", "NM", "MT", "WY", "ID"]);
  const central = new Set([
    "TX", "OK", "KS", "NE", "MO", "IL", "MN", "IA", "WI",
    "ND", "SD", "AR", "LA", "MS", "AL", "TN",
  ]);

  if (westCoast.has(destinationState)) return 8000;   // $80
  if (mountain.has(destinationState)) return 10000;   // $100
  if (central.has(destinationState)) return 12500;    // $125
  if (destinationState === "AK" || destinationState === "HI") return 17500; // $175
  return 15000; // $150 — East Coast / default
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as ShipRequest;
    const { items, destination } = body;

    if (!items || items.length === 0 || !destination?.zip) {
      return Response.json({ error: "Missing items or destination" }, { status: 400 });
    }

    const hasLarge = items.some((i) => LARGE_ITEMS.has(i.id));
    const hasSmall = items.some((i) => !LARGE_ITEMS.has(i.id));

    let totalShipping = 0;
    const breakdown: { carrier: string; rate: number; label: string }[] = [];

    if (hasLarge) {
      // Try FedEx API, fall back to zone estimate
      const fedexRate = await getFedExRate(context.env, destination.zip);
      const rate = fedexRate ?? getFedExFallbackRate(destination.state);
      totalShipping += rate;
      breakdown.push({
        carrier: "FedEx Home Delivery",
        rate,
        label: fedexRate ? "Real-time rate" : "Estimated rate",
      });
    }

    if (hasSmall) {
      totalShipping += USPS_RATES.medium;
      breakdown.push({
        carrier: "USPS Flat Rate",
        rate: USPS_RATES.medium,
        label: "Medium Flat Rate Box",
      });
    }

    return Response.json({
      total: totalShipping,
      breakdown,
    });
  } catch {
    return Response.json({ error: "Failed to calculate shipping" }, { status: 500 });
  }
};
