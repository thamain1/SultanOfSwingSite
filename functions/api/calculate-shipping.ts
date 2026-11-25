import { validateItems } from "../../shared/pricing.ts";
import { quoteShipping, type ShippingEnv } from "../_shared/shipping.ts";

interface ShipRequest {
  items: { id: string; qty: number }[];
  destination: { zip: string; state: string };
}

export const onRequestPost: PagesFunction<ShippingEnv> = async (context) => {
  try {
    const body = await context.request.json() as ShipRequest;
    const { items, destination } = body;

    if (!destination?.zip) {
      return Response.json({ error: "Missing items or destination" }, { status: 400 });
    }

    const valid = validateItems(items);
    if (!valid.ok) {
      return Response.json({ error: valid.error }, { status: 400 });
    }

    const quote = await quoteShipping(context.env, valid.items, destination);
    return Response.json({ total: quote.total, breakdown: quote.breakdown });
  } catch {
    return Response.json({ error: "Failed to calculate shipping" }, { status: 500 });
  }
};
