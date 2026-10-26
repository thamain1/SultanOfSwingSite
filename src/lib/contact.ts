// Sales contact shown wherever the site says "call / email for pricing".
// TODO: phone is a placeholder until Rick confirms the number. Do not deploy with this value.
export const SALES_PHONE = {
  display: "(000) 000-0000",
  tel: "+10000000000",
};

// Same inbox as the footer's Contact link
export const SALES_EMAIL = "sultan.of.swing.sales@gmail.com";

export function pricingMailto(productName?: string): string {
  const subject = productName ? `Pricing request: ${productName}` : "Pricing request";
  return `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
