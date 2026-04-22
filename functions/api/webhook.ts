interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET?: string;
  SENDGRID_API_KEY?: string;
  SENDGRID_FROM_EMAIL?: string;
}

const PRODUCT_NAMES: Record<string, string> = {
  "sb-1000": "Sultan Softball",
  "bb-2000": "Sultan Baseball",
  "pc-plate": "Portable/Collapsible Plate",
  "sb-pk": "Softball Bungees & Rope Cables Pack",
  "bb-pk": "Baseball Bungees & Rope Cables Pack",
  "bb-complete": "Baseball Complete Bungee/Rope/Cables/Connectors",
  "sb-complete": "Softball Complete Bungee/Rope/Cables/Connectors",
};

// --- Stripe signature verification (HMAC-SHA256 via Web Crypto) ---

async function verifyStripeSignature(
  rawBody: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, val] = part.split("=");
    if (key && val) acc[key.trim()] = val.trim();
    return acc;
  }, {});

  const timestamp = parts["t"];
  const v1Signature = parts["v1"];
  if (!timestamp || !v1Signature) return false;

  // Reject if timestamp is older than 5 minutes
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signed = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${rawBody}`),
  );

  const computed = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === v1Signature;
}

// --- Order notification email via SendGrid ---

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

async function sendOrderNotification(
  env: Env,
  intent: Record<string, unknown>,
): Promise<void> {
  if (!env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY not set — skipping order notification");
    return;
  }

  const metadata = (intent.metadata ?? {}) as Record<string, string>;
  const shipping = intent.shipping as {
    name?: string;
    address?: { line1?: string; city?: string; state?: string; postal_code?: string };
  } | undefined;

  const amount = Number(intent.amount) || 0;
  const subtotal = Number(metadata.subtotal) || 0;
  const discount = Number(metadata.discount) || 0;
  const shippingCost = Number(metadata.shipping) || 0;
  const promoCode = metadata.promoCode || "None";

  let itemsHtml = "";
  try {
    const items = JSON.parse(metadata.items || "[]") as { id: string; qty: number }[];
    itemsHtml = items
      .map((i) => `<li>${i.qty}x ${PRODUCT_NAMES[i.id] || i.id}</li>`)
      .join("");
  } catch {
    itemsHtml = "<li>(could not parse items)</li>";
  }

  // Prefer sticky metadata shipping fields (written at PaymentIntent creation).
  // Fall back to intent.shipping in case metadata isn't present (legacy orders).
  const shipName    = metadata.ship_name    || shipping?.name                   || "";
  const shipLine1   = metadata.ship_line1   || shipping?.address?.line1         || "";
  const shipCity    = metadata.ship_city    || shipping?.address?.city          || "";
  const shipState   = metadata.ship_state   || shipping?.address?.state         || "";
  const shipZip     = metadata.ship_zip     || shipping?.address?.postal_code   || "";
  const shipCountry = metadata.ship_country || "";
  const shipEmail   = metadata.ship_email   || (intent.receipt_email as string | undefined) || "";
  const shipPhone   = metadata.ship_phone   || "";

  const hasAddress = shipName || shipLine1 || shipCity;
  const addressHtml = hasAddress
    ? `${shipName}<br>${shipLine1}<br>${shipCity}, ${shipState} ${shipZip}${shipCountry ? "<br>" + shipCountry : ""}${shipPhone ? `<br>Phone: ${shipPhone}` : ""}`
    : "⚠️ SHIPPING ADDRESS MISSING — contact customer before shipping";

  const fromEmail = env.SENDGRID_FROM_EMAIL || "alerts@4wardmotions.com";

  const html = `
    <h2 style="color:#f97316;">New Sultan of Swing Order!</h2>
    <table style="border-collapse:collapse;width:100%;max-width:500px;">
      <tr><td style="padding:6px;font-weight:bold;">Customer Email</td><td style="padding:6px;">${intent.receipt_email || "N/A"}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Ship To</td><td style="padding:6px;">${addressHtml}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Items</td><td style="padding:6px;"><ul style="margin:0;padding-left:18px;">${itemsHtml}</ul></td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Promo Code</td><td style="padding:6px;">${promoCode}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Subtotal</td><td style="padding:6px;">${formatCents(subtotal)}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Discount</td><td style="padding:6px;">-${formatCents(discount)}</td></tr>
      <tr><td style="padding:6px;font-weight:bold;">Shipping</td><td style="padding:6px;">${formatCents(shippingCost)}</td></tr>
      <tr style="border-top:2px solid #333;"><td style="padding:6px;font-weight:bold;font-size:18px;">Total Charged</td><td style="padding:6px;font-size:18px;color:#f97316;">${formatCents(amount)}</td></tr>
    </table>
    <p style="color:#666;font-size:12px;margin-top:16px;">Payment ID: ${intent.id}</p>
  `;

  await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: "rickgamboa123@gmail.com" }] }],
      from: { email: fromEmail, name: "Sultan of Swing Orders" },
      subject: `New Order — ${formatCents(amount)}`,
      content: [{ type: "text/html", value: html }],
    }),
  });
}

// --- Webhook handler ---

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { STRIPE_WEBHOOK_SECRET } = context.env;

  const rawBody = await context.request.text();
  const signature = context.request.headers.get("stripe-signature");

  // Signature verification
  if (STRIPE_WEBHOOK_SECRET && signature) {
    const valid = await verifyStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET);
    if (!valid) {
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }
  } else if (!STRIPE_WEBHOOK_SECRET) {
    console.warn("Stripe webhook: STRIPE_WEBHOOK_SECRET not set — skipping verification");
  } else {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      type: string;
      data: { object: Record<string, unknown> };
    };

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        console.log(`Payment succeeded: ${intent.id} — ${intent.amount}`);

        // Non-blocking: send order notification email
        try {
          await sendOrderNotification(context.env, intent);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(`Order notification email failed: ${msg}`);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        console.log(`Payment failed: ${intent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch {
    return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
};
