// Sales contact shown wherever the site says "call / email for pricing".
export const SALES_PHONE = {
  display: "(818) 371-9006",
  tel: "+18183719006",
};

// Same inbox as the footer's Contact link
export const SALES_EMAIL = "sultan.of.swing.sales@gmail.com";

export function pricingMailto(productName?: string): string {
  const subject = productName ? `Pricing request: ${productName}` : "Pricing request";
  return `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
