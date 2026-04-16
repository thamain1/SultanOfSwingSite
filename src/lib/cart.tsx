import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { PRODUCTS, PROMO_CODES, PROMO_DISCOUNTS, USPS_FLAT_RATES, type Product } from "./products";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [shippingCost, setShippingCost] = useState<number | null>(null);

  const addItem = useCallback((productId: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing) {
        return prev.map((i) =>
          i.product.id === productId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      const product = PRODUCTS.find((p) => p.id === productId);
      if (!product) return prev;
      return [...prev, { product, qty: 1 }];
    });
    setShippingCost(null); // reset shipping when cart changes
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    setShippingCost(null);
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) =>
          i.product.id === productId ? { ...i, qty } : i
        )
      );
    }
    setShippingCost(null);
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode("");
    setShippingCost(null);
  }, []);

  const appliedPromo = PROMO_CODES[promoCode.toUpperCase()] || null;

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
  const discount = appliedPromo
    ? items.reduce((sum, i) => {
        const rate = PROMO_DISCOUNTS[i.product.promoTier];
        return sum + Math.round(i.product.price * i.qty * rate);
      }, 0)
    : 0;

  const hasLargeItem = items.some((i) => i.product.shippingType === "ups");
  const hasSmallItem = items.some((i) => i.product.shippingType === "usps");

  // Auto-calculate USPS shipping for small-only orders
  const resolvedShipping = (() => {
    if (items.length === 0) return 0;
    if (shippingCost !== null) return shippingCost;
    // If only small items, use USPS medium flat rate as default
    if (!hasLargeItem && hasSmallItem) return USPS_FLAT_RATES.medium;
    return null; // needs UPS quote
  })();

  const total =
    subtotal -
    discount +
    (resolvedShipping ?? 0);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQty,
        clearCart,
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
