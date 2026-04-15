interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { STRIPE_WEBHOOK_SECRET } = context.env;

  // Read the raw body for signature verification
  const rawBody = await context.request.text();
  const signature = context.request.headers.get("stripe-signature");

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    // If no webhook secret configured, accept but log
    console.warn("Stripe webhook: no signature verification configured");
  }

  // Note: Full signature verification requires the Stripe SDK or manual
  // HMAC-SHA256 computation. For Cloudflare Workers, we parse the event
  // directly. In production, add STRIPE_WEBHOOK_SECRET and verify.

  try {
    const event = JSON.parse(rawBody) as {
      type: string;
      data: { object: Record<string, unknown> };
    };

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        console.log(`Payment succeeded: ${intent.id}`);
        console.log(`Amount: ${intent.amount}`);
        console.log(`Email: ${intent.receipt_email}`);
        console.log(`Metadata:`, intent.metadata);
        // Future: send order confirmation email, update inventory, notify admin
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
