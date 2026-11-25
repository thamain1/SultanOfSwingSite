import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { PRODUCTS, type Product } from "./products";
import { MAX_QTY_PER_ITEM, USPS_RATES, isLargeItem, isValidPromoCode, priceCart, validateItems, PROMO_CODE, STAND_PROMO_PRICE, formatDollars } from "./pricing";

export interface CartItem {
  product: Product;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  /** True while a payment is being created or confirmed: the cart and promo code are frozen. */
  locked: boolean;
  setLocked: (locked: boolean) => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  appliedPromo: { label: string } | null;
  subtotal: number;
  discount: number;
  shippingCost: number | null; // null = not yet calculated
  setShippingCost: (cost: number | null) => void;
  total: number;
  itemCount: number;
  hasLargeItem: boolean;
  hasSmallItem: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

// The cart (ids, quantities, promo code) survives a reload and the trip to an
// Affirm or Klarna page and back, for this tab only. Shipping is never stored:
// it is quoted again from the server. Cleared once the order succeeds.
const STORAGE_KEY = "sos-cart-v1";

function loadStored(): { items: CartItem[]; promo: string } {
  const empty = { items: [] as CartItem[], promo: "" };
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const data = JSON.parse(raw) as { items?: unknown; promo?: unknown };
    const valid = validateItems(data.items);
    if (!valid.ok) return empty;
    const items: CartItem[] = [];
    for (const { id, qty } of valid.items) {
      const product = PRODUCTS.find((p) => p.id === id);
      if (product) items.push({ product, qty });
    }
    const promo = typeof data.promo === "string" ? data.promo.slice(0, 40) : "";
    return { items, promo };
  } catch {
    return empty;
  }
}

function saveStored(items: CartItem[], promo: string): void {
  try {
    if (items.length === 0 && promo === "") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ items: items.map((i) => ({ id: i.product.id, qty: i.qty })), promo }),
      );
    }
  } catch {
    // storage blocked or full: the cart still works for this page view
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadStored);
  const [items, setItems] = useState<CartItem[]>(initial.items);
  const [promoCode, setPromoCodeState] = useState(initial.promo);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [locked, setLockedState] = useState(false);
  const lockedRef = useRef(false);

  const setLocked = useCallback((value: boolean) => {
    lockedRef.current = value;
    setLockedState(value);
  }, []);

  useEffect(() => {
    saveStored(items, promoCode);
  }, [items, promoCode]);

  const setPromoCode = useCallback((code: string) => {
    if (lockedRef.current) return;
    setPromoCodeState(code);
  }, []);

  const addItem = useCallback((productId: string) => {
    if (lockedRef.current) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing) {
        return prev.map((i) =>
          i.product.id === productId ? { ...i, qty: Math.min(i.qty + 1, MAX_QTY_PER_ITEM) } : i
        );
      }
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) return prev;
      return [...prev, { product, qty: 1 }];
    });
    setShippingCost(null); // reset shipping when cart changes
  }, []);

  const removeItem = useCallback((productId: string) => {
    if (lockedRef.current) return;
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    setShippingCost(null);
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (lockedRef.current) return;
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, qty: Math.min(qty, MAX_QTY_PER_ITEM) } : i
        )
      );
    }
    setShippingCost(null);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCodeState("");
    setShippingCost(null);
    setLocked(false);
  }, [setLocked]);

  const appliedPromo = isValidPromoCode(promoCode)
    ? { label: `${PROMO_CODE} applied: stands ${formatDollars(STAND_PROMO_PRICE)}` }
    : null;

  const hasLargeItem = items.some((i) => isLargeItem(i.product.id));
  const hasSmallItem = items.some((i) => !isLargeItem(i.product.id));

  // Auto-calculate USPS shipping for small-only orders
  const resolvedShipping = (() => {
    if (items.length === 0) return 0;
    if (shippingCost !== null) return shippingCost;
    // If only small items, use USPS medium flat rate as default
    if (!hasLargeItem && hasSmallItem) return USPS_RATES.medium;
    return null; // needs FedEx quote
  })();

  // Same function the server uses to set the charge (shared/pricing.ts).
  const { subtotal, discount, total } = priceCart(
    items.map((i) => ({ id: i.product.id, qty: i.qty })),
    promoCode,
    resolvedShipping ?? 0,
  );

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        locked,
        setLocked,
        promoCode,
        setPromoCode,
        appliedPromo,
        subtotal,
        discount,
        shippingCost: resolvedShipping,
        setShippingCost,
        total,
        itemCount,
        hasLargeItem,
        hasSmallItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
