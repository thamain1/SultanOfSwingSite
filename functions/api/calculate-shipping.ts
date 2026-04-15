interface Env {
  UPS_CLIENT_ID?: string;
  UPS_CLIENT_SECRET?: string;
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

async function getUpsRate(
  env: Env,
  destinationZip: string,
): Promise<number | null> {
  if (!env.UPS_CLIENT_ID || !env.UPS_CLIENT_SECRET) {
    return null; // UPS not configured, use fallback
  }

  try {
    // Step 1: Get OAuth token
    const tokenRes = await fetch("https://onlinetools.ups.com/security/v1/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${env.UPS_CLIENT_ID}:${env.UPS_CLIENT_SECRET}`)}`,
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json() as { access_token?: string };
    if (!tokenData.access_token) return null;

    // Step 2: Get rate quote
    // TODO: Replace placeholder weight/dimensions with actual product specs
    const rateBody = {
      RateRequest: {
        Shipment: {
          Shipper: {
            Address: { PostalCode: ORIGIN_ZIP, CountryCode: "US" },
          },
          ShipTo: {
            Address: { PostalCode: destinationZip, CountryCode: "US" },
          },
          ShipFrom: {
            Address: { PostalCode: ORIGIN_ZIP, CountryCode: "US" },
          },
          Package: {
            PackagingType: { Code: "02" }, // Customer Supplied Package
            PackageWeight: {
              UnitOfMeasurement: { Code: "LBS" },
              Weight: "25", // placeholder — update with real weight
            },
            Dimensions: {
              UnitOfMeasurement: { Code: "IN" },
              Length: "36", // placeholder
              Width: "18",  // placeholder
              Height: "12", // placeholder
            },
          },
          Service: { Code: "03" }, // UPS Ground
        },
      },
    };

    const rateRes = await fetch("https://onlinetools.ups.com/api/rating/v1/Rate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
        "transId": crypto.randomUUID(),
        "transactionSrc": "sultanofswing",
      },
      body: JSON.stringify(rateBody),
    });

    const rateData = await rateRes.json() as {
      RateResponse?: {
        RatedShipment?: { TotalCharges?: { MonetaryValue?: string } };
      };
    };

    const charge = rateData?.RateResponse?.RatedShipment?.TotalCharges?.MonetaryValue;
    if (charge) {
      return Math.round(parseFloat(charge) * 100); // convert to cents
    }

    return null;
  } catch {
    return null;
  }
}

// Fallback flat rate when UPS API unavailable
function getUpsFallbackRate(destinationState: string): number {
  const westCoast = new Set(["CA", "OR", "WA", "NV", "AZ"]);
  const central = new Set(["TX", "CO", "IL", "MO", "OK", "KS", "NE", "NM", "UT", "MT", "WY", "ND", "SD", "MN", "IA", "WI", "AR", "LA", "MS", "AL", "TN"]);

  if (westCoast.has(destinationState)) return 1500; // $15
  if (central.has(destinationState)) return 2500;    // $25
  if (destinationState === "HI" || destinationState === "AK") return 5500; // $55
  return 3500; // $35 — East Coast / default
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
      // Try UPS API, fall back to zone estimate
      const upsRate = await getUpsRate(context.env, destination.zip);
      const rate = upsRate ?? getUpsFallbackRate(destination.state);
      totalShipping += rate;
      breakdown.push({
        carrier: "UPS Ground",
        rate,
        label: upsRate ? "Real-time rate" : "Estimated rate",
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
