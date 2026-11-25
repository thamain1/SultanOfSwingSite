// Catalog only. Prices, promo tiers and shipping class live in shared/pricing.ts.
export interface Product {
  id: string;
  model: string;
  name: string;
  description: string;
  image: string;
  category: "main" | "accessory";
}

export const PRODUCTS: Product[] = [
  {
    id: "sb-1000",
    model: "SB-1000",
    name: "Sultan of Swing — Softball",
    description: "Bungee-cord batting trainer designed for softball. Full swing-through, game-like contact.",
    image: "/assets/products/sultan-softball.jpeg",
    category: "main",
  },
  {
    id: "bb-2000",
    model: "BB-2000",
    name: "Sultan of Swing — Baseball",
    description: "Bungee-cord batting trainer designed for baseball. Build timing and barrel control.",
    image: "/assets/products/sultan-baseball.jpeg",
    category: "main",
  },
  {
    id: "pc-plate",
    model: "PC PLATE",
    name: "Portable / Collapsible Plate",
    description: "Lightweight, portable home plate. Folds flat for easy transport.",
    image: "/assets/products/portable-plate.jpeg",
    category: "accessory",
  },
  {
    id: "sb-pk",
    model: "SB-PK",
    name: "Softball Bungees & Rope Cables Pack",
    description: "Replacement softball, bungees, and rope cables for Sultan of Swing Softball.",
    image: "/assets/products/softball-cable-pack.png",
    category: "accessory",
  },
  {
    id: "bb-pk",
    model: "BB-PK",
    name: "Baseball Bungees & Rope Cables Pack",
    description: "Replacement baseball, bungees, and rope cables for Sultan of Swing Baseball.",
    image: "/assets/products/baseball-cable-pack.jpeg",
    category: "accessory",
  },
  {
    id: "bb-complete",
    model: "BB",
    name: "Baseball Complete Bungee, Rope, Cables & Connectors",
    description: "Complete replacement kit — baseball, bungee, rope, cables, and connectors.",
    image: "/assets/products/complete-bungee-pack.png",
    category: "accessory",
  },
  {
    id: "sb-complete",
    model: "SB",
    name: "Softball Complete Bungee, Rope, Cables & Connectors",
    description: "Complete replacement kit — softball, bungee, rope, cables, and connectors.",
    image: "/assets/products/complete-bungee-pack.png",
    category: "accessory",
  },
];
