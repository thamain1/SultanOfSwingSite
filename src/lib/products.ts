export interface Product {
  id: string;
  model: string;
  name: string;
  description: string;
  price: number; // cents
  image: string;
  category: "main" | "accessory";
  shippingType: "ups" | "usps";
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
  },
  {
    id: "pc-plate",
    model: "PC PLATE",
    name: "Portable / Collapsible Plate",
    description: "Lightweight, portable home plate. Folds flat for easy transport.",
    price: 4500,
    image: "/assets/products/portable-plate.png",
    category: "accessory",
    shippingType: "usps",
  },
  {
    id: "sb-pk",
    model: "SB-PK",
    name: "Softball & Cable Pack",
    description: "Replacement softball and bungee cable for Sultan of Swing Softball.",
    price: 4850,
    image: "/assets/products/softball-cable-pack.png",
    category: "accessory",
    shippingType: "usps",
  },
  {
    id: "bb-pk",
    model: "BB-PK",
    name: "Baseball & Cable Pack",
    description: "Replacement baseball and bungee cable for Sultan of Swing Baseball.",
    price: 4250,
    image: "/assets/products/baseball-cable-pack.jpeg",
    category: "accessory",
    shippingType: "usps",
  },
];

export const PROMO_CODES: Record<string, { discount: number; label: string }> = {
  "PLATOS#1": { discount: 0.10, label: "Tournament Pricing — 10% Off" },
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
