interface Env {
  STRIPE_SECRET_KEY: string;
}

interface CartItem {
  id: string;
  qty: number;
}

// Server-side product prices (cents) — source of truth
const PRICES: Record<string, number> = {
  "sb-1000": 49500,
  "bb-2000": 48950,
  "pc-plate": 4500,
  "sb-pk": 4850,
  "bb-pk": 4250,
};

const PROMO_CODES: Record<string, number> = {
  "PLATOS#1": 0.10,
};

// USPS Flat Rate (cents)
const USPS_MEDIUM_FLAT = 1610;

function calculateShipping(items: CartItem[]): number {
  const hasLarge = items.some((i) => i.id === "sb-1000" || i.id === "bb-2000");
  const hasSmall = items.some((i) => !["sb-1000", "bb-2000"].includes(i.id));

  let shipping = 0;

  if (hasLarge) {
    // UPS placeholder — will be replaced with real UPS API rate
    // For now, use flat estimate based on weight zone
    shipping += 3500; // $35 placeholder for large items
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
    };

    const { items, shipping, email, promoCode, paymentMethod = "card" } = body;

    if (!items || items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals server-side (never trust client)
    let subtotal = 0;
    for (const item of items) {
      const price = PRICES[item.id];
      if (!price) {
        return Response.json({ error: `Unknown product: ${item.id}` }, { status: 400 });
      }
      subtotal += price * item.qty;
    }

    // Apply promo discount
    let discount = 0;
    if (promoCode && PROMO_CODES[promoCode.toUpperCase()]) {
      discount = Math.round(subtotal * PROMO_CODES[promoCode.toUpperCase()]);
    }

    const shippingCost = calculateShipping(items);
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
