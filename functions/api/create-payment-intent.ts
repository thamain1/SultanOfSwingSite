interface Env {
  STRIPE_SECRET_KEY: string;
}

interface CartItem {
  id: string;
  qty: number;
}

// Server-side product prices (cents) — source of truth
const PRODUCTS: Record<string, { price: number; promoTier: "standard" | "pack" }> = {
  "sb-1000": { price: 49500, promoTier: "standard" },
  "bb-2000": { price: 48950, promoTier: "standard" },
  "pc-plate": { price: 4500, promoTier: "standard" },
  "sb-pk": { price: 4850, promoTier: "pack" },
  "bb-pk": { price: 4250, promoTier: "pack" },
  "bb-complete": { price: 5000, promoTier: "pack" },
  "sb-complete": { price: 5350, promoTier: "pack" },
};

const PROMO_DISCOUNTS: Record<string, number> = {
  standard: 0.10, // 10% off
  pack: 0.20,     // 20% off
};

const VALID_PROMO_CODES = new Set(["PLATOS#1"]);

// USPS Flat Rate (cents)
const USPS_MEDIUM_FLAT = 1610;

const LARGE_IDS = new Set(["sb-1000", "bb-2000"]);

// Maximum acceptable shipping cost (cents) — sanity check ceiling
const MAX_SHIPPING = 25000; // $250

function calculateFallbackShipping(items: CartItem[]): number {
  const hasLarge = items.some((i) => LARGE_IDS.has(i.id));
  const hasSmall = items.some((i) => !LARGE_IDS.has(i.id));

  let shipping = 0;

  if (hasLarge) {
    shipping += 15000; // $150 — conservative East Coast fallback for FedEx Home Delivery
  }

  if (hasSmall) {
    shipping += USPS_MEDIUM_FLAT;
  }

  return shipping;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { STRIPE_SECRET_KEY } = context.env;

  if (!STRIPE_SECRET_KEY) {
    return Response.json({ error: "Payment service not configured" }, { status: 500 });
  }

  try {
    const body = await context.request.json() as {
      items: CartItem[];
      shipping: { name: string; address: string; city: string; state: string; zip: string };
      email: string;
      promoCode?: string;
      paymentMethod?: "card" | "affirm";
      shippingTotal?: number;
    };

    const { items, shipping, email, promoCode, paymentMethod = "card", shippingTotal } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals server-side (never trust client)
    let subtotal = 0;
    for (const item of items) {
      const product = PRODUCTS[item.id];
      if (!product) {
        return Response.json({ error: `Unknown product: ${item.id}` }, { status: 400 });
      }
      subtotal += product.price * item.qty;
    }

    // Apply tiered promo discount (10% standard, 20% packs)
    let discount = 0;
    if (promoCode && VALID_PROMO_CODES.has(promoCode.toUpperCase())) {
      for (const item of items) {
        const product = PRODUCTS[item.id];
        if (product) {
          const rate = PROMO_DISCOUNTS[product.promoTier];
          discount += Math.round(product.price * item.qty * rate);
        }
      }
    }

    // Use client-provided shipping if valid, otherwise fall back
    const fallback = calculateFallbackShipping(items);
    let shippingCost: number;

    if (typeof shippingTotal === "number" && shippingTotal > 0 && shippingTotal <= MAX_SHIPPING) {
      shippingCost = shippingTotal;
    } else {
      shippingCost = fallback;
    }

    const total = subtotal - discount + shippingCost;

    if (total < 50) {
      return Response.json({ error: "Order total too low" }, { status: 400 });
    }

    // Build payment method types
    const paymentMethodTypes: string[] = ["card"];
    if (paymentMethod === "affirm") {
      paymentMethodTypes.push("affirm");
    }

    // Build line item description
    const description = items
      .map((i) => `${i.qty}x ${i.id}`)
      .join(", ");

    // Create PaymentIntent via Stripe REST API
    const params = new URLSearchParams();
    params.append("amount", total.toString());
    params.append("currency", "usd");
    params.append("description", `Sultan of Swing Order: ${description}`);
    params.append("receipt_email", email);
    params.append("shipping[name]", shipping.name);
    params.append("shipping[address][line1]", shipping.address);
    params.append("shipping[address][city]", shipping.city);
    params.append("shipping[address][state]", shipping.state);
    params.append("shipping[address][postal_code]", shipping.zip);
    params.append("shipping[address][country]", "US");
    params.append("automatic_payment_methods[enabled]", "true");
    params.append("metadata[items]", JSON.stringify(items));
    params.append("metadata[promoCode]", promoCode || "");
    params.append("metadata[subtotal]", subtotal.toString());
    params.append("metadata[discount]", discount.toString());
    params.append("metadata[shipping]", shippingCost.toString());

    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const intent = await stripeRes.json() as { client_secret?: string; error?: { message: string } };

    if (intent.error) {
      return Response.json({ error: intent.error.message }, { status: 400 });
    }

    return Response.json({
      clientSecret: intent.client_secret,
      subtotal,
      discount,
      shipping: shippingCost,
      total,
    });
  } catch {
    return Response.json({ error: "Failed to create payment" }, { status: 500 });
  }
};
