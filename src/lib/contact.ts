// Sales contact shown on the shop page's "Questions?" line.
export const SALES_PHONE = {
  display: "(818) 371-9006",
  tel: "+18183719006",
};

// Same inbox as the footer's Contact link
export const SALES_EMAIL = "sultan.of.swing.sales@gmail.com";

export function contactMailto(subject = "Question about Sultan of Swing"): string {
  return `mailto:${SALES_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
