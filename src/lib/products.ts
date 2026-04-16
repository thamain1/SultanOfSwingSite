export interface Product {
  id: string;
  model: string;
  name: string;
  description: string;
  price: number; // cents
  image: string;
  category: "main" | "accessory";
  shippingType: "ups" | "usps";
  promoTier: "standard" | "pack"; // standard = 10%, pack = 20%
}

export const PRODUCTS: Product[] = [
  {
    id: "sb-1000",
    model: "SB-1000",
    name: "Sultan of Swing — Softball",
    description: "Bungee-cord batting trainer designed for softball. Full swing-through, game-like contact.",
    price: 49500,
    image: "/assets/products/sultan-softball.jpeg",
    category: "main",
    shippingType: "ups",
    promoTier: "standard",
  },
  {
    id: "bb-2000",
    model: "BB-2000",
    name: "Sultan of Swing — Baseball",
    description: "Bungee-cord batting trainer designed for baseball. Build timing and barrel control.",
    price: 48950,
    image: "/assets/products/sultan-baseball.jpeg",
    category: "main",
    shippingType: "ups",
    promoTier: "standard",
  },
  {
    id: "pc-plate",
    model: "PC PLATE",
    name: "Portable / Collapsible Plate",
    description: "Lightweight, portable home plate. Folds flat for easy transport.",
    price: 4500,
    image: "/assets/products/portable-plate.jpeg",
    category: "accessory",
    shippingType: "usps",
    promoTier: "standard",
  },
  {
    id: "sb-pk",
    model: "SB-PK",
    name: "Softball Bungees & Rope Cables Pack",
    description: "Replacement softball, bungees, and rope cables for Sultan of Swing Softball.",
    price: 4850,
    image: "/assets/products/softball-cable-pack.png",
    category: "accessory",
    shippingType: "usps",
    promoTier: "pack",
  },
  {
    id: "bb-pk",
    model: "BB-PK",
    name: "Baseball Bungees & Rope Cables Pack",
    description: "Replacement baseball, bungees, and rope cables for Sultan of Swing Baseball.",
    price: 4250,
    image: "/assets/products/baseball-cable-pack.jpeg",
    category: "accessory",
    shippingType: "usps",
    promoTier: "pack",
  },
  {
    id: "bb-complete",
    model: "BB",
    name: "Baseball Complete Bungee, Rope, Cables & Connectors",
    description: "Complete replacement kit — baseball, bungee, rope, cables, and connectors.",
    price: 5000,
    image: "/assets/products/complete-bungee-pack.png",
    category: "accessory",
    shippingType: "usps",
    promoTier: "pack",
  },
  {
    id: "sb-complete",
    model: "SB",
    name: "Softball Complete Bungee, Rope, Cables & Connectors",
    description: "Complete replacement kit — softball, bungee, rope, cables, and connectors.",
    price: 5350,
    image: "/assets/products/complete-bungee-pack.png",
    category: "accessory",
    shippingType: "usps",
    promoTier: "pack",
  },
];

export const PROMO_DISCOUNTS = {
  standard: 0.10, // 10% off main items + plate
  pack: 0.20,     // 20% off cable/complete packs
};

export const PROMO_CODES: Record<string, { label: string }> = {
  "PLATOS#1": { label: "Tournament Pricing" },
};

// USPS Flat Rate box prices (cents) — updated annually in January
export const USPS_FLAT_RATES = {
  small: 1040,
  medium: 1610,
  large: 2290,
};

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
