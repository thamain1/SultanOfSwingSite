import { PROMO_CODE, isValidPromoCode, priceCart, validateDestination, validateItems } from "../../shared/pricing.ts";
import { quoteShipping, type ShippingEnv } from "../_shared/shipping.ts";

interface Env extends ShippingEnv {
  STRIPE_SECRET_KEY: string;
}

interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

// Free-text fields from the form: bounded so one request cannot overflow Stripe's
// 500-character metadata limit or smuggle a huge value into the order email.
const MAX_FIELD_LENGTH = 200;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= MAX_FIELD_LENGTH;
}

function isEmail(v: unknown): v is string {
  return typeof v === "string" && v.length <= 254 && EMAIL_PATTERN.test(v.trim());
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { STRIPE_SECRET_KEY } = context.env;

  if (!STRIPE_SECRET_KEY) {
    return Response.json({ error: "Payment service not configured" }, { status: 500 });
  }

  try {
    // Everything in the body is untrusted. Only item ids, quantities, the promo
    // code, the destination and the shipping amount the shopper SAW are read;
    // any price, amount or total the client sends is ignored.
    const body = await context.request.json() as {
      items?: unknown;
      shipping?: Partial<ShippingAddress>;
      email?: unknown;
      phone?: unknown;
      promoCode?: unknown;
      paymentMethod?: "card" | "affirm" | "klarna";
      shippingTotal?: unknown;
    };

    const { shipping, email, phone, promoCode, shippingTotal } = body;

    const valid = validateItems(body.items);
    if (!valid.ok) {
      return Response.json({ error: valid.error }, { status: 400 });
    }
    const items = valid.items;

    if (
      !shipping ||
      !isNonEmptyString(shipping.name) ||
      !isNonEmptyString(shipping.address) ||
      !isNonEmptyString(shipping.city) ||
      !isEmail(email)
    ) {
      return Response.json({ error: "Please check your name, email and address." }, { status: 400 });
    }
    if (phone !== undefined && phone !== null && phone !== "" && (typeof phone !== "string" || phone.length > 40)) {
      return Response.json({ error: "Please check your phone number." }, { status: 400 });
    }

    // State must be a real state (or DC), ZIP must be 5 or 9 digits, and the ZIP
    // must belong to that state. 400 before any Stripe call.
    const dest = validateDestination(shipping.zip, shipping.state);
    if (!dest.ok) {
      return Response.json({ error: dest.error }, { status: 400 });
    }

    // Shipping is computed here from items + destination (same function as the
    // quote the shopper sees). The client's number is only a check: if it is not
    // exactly what the server computed, return 409 with the server's number and
    // charge nothing, so the shopper is never charged a total they did not see.
    const quote = await quoteShipping(context.env, items, dest);
    const shippingCost = quote.total;
    if (shippingTotal !== shippingCost) {
      return Response.json(
        { error: "Shipping changed. Please review your total and try again.", shipping: shippingCost },
        { status: 409 },
      );
    }

    const { subtotal, discount, total } = priceCart(items, promoCode, shippingCost);

    if (total < 50) {
      return Response.json({ error: "Order total too low" }, { status: 400 });
    }

    // Build line item description
    const description = items
      .map((i) => `${i.qty}x ${i.id}`)
      .join(", ");

    // Record the code only when it was actually applied.
    const promoUsed = isValidPromoCode(promoCode) ? PROMO_CODE : "";

    // Create PaymentIntent via Stripe REST API
    const params = new URLSearchParams();
    params.append("amount", total.toString());
    params.append("currency", "usd");
    params.append("description", `Sultan of Swing Order: ${description}`);
    params.append("receipt_email", email);
    params.append("shipping[name]", shipping.name);
    params.append("shipping[address][line1]", shipping.address);
    params.append("shipping[address][city]", shipping.city);
    params.append("shipping[address][state]", dest.state);
    params.append("shipping[address][postal_code]", dest.zip);
    params.append("shipping[address][country]", "US");
    params.append("automatic_payment_methods[enabled]", "true");
    params.append("metadata[items]", JSON.stringify(items));
    params.append("metadata[promoCode]", promoUsed);
    params.append("metadata[subtotal]", subtotal.toString());
    params.append("metadata[discount]", discount.toString());
    params.append("metadata[shipping]", shippingCost.toString());
    // Shipping address persisted to metadata: survives any Stripe Elements
    // re-confirm that might clear the top-level `shipping` field.
    params.append("metadata[ship_name]",    shipping.name);
    params.append("metadata[ship_line1]",   shipping.address);
    params.append("metadata[ship_city]",    shipping.city);
    params.append("metadata[ship_state]",   dest.state);
    params.append("metadata[ship_zip]",     dest.zip);
    params.append("metadata[ship_country]", "US");
    params.append("metadata[ship_email]",   email);
    if (isNonEmptyString(phone)) params.append("metadata[ship_phone]", phone);

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
