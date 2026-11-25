import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { PRODUCTS, type Product } from "./products";
import { MAX_QTY_PER_ITEM, USPS_RATES, isLargeItem, isValidPromoCode, priceCart, PROMO_CODE, STAND_PROMO_PRICE, formatDollars } from "./pricing";

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
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
    setShippingCost(null);
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
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
    setPromoCode("");
    setShippingCost(null);
  }, []);

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
