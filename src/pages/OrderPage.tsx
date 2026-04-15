import { useState } from "react";
import { Link } from "react-router-dom";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { stripePromise } from "../lib/stripe";
import { useCart } from "../lib/cart";
import { PRODUCTS, formatPrice } from "../lib/products";

const oswald = { fontFamily: "Oswald, sans-serif" };

/* ─── Product Card ─── */
function ProductCard({ id, name, model, price, image, description, category }: {
  id: string; name: string; model: string; price: number;
  image: string; description: string; category: string;
}) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.product.id === id);

  return (
    <div className="border border-white/10 bg-zinc-950 hover:border-orange-500/50 transition-all group flex flex-col">
      <div className="relative overflow-hidden bg-white">
        <img src={image} alt={name} className="w-full h-48 object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
        {category === "main" && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] tracking-widest px-2 py-0.5 uppercase" style={oswald}>
            Main Unit
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-gray-500 text-[10px] tracking-widest uppercase">{model}</p>
        <h3 style={oswald} className="text-white font-bold tracking-wide mt-1 text-lg leading-tight">{name}</h3>
        <p className="text-gray-400 text-xs mt-2 leading-relaxed flex-1">{description}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
          <span style={oswald} className="text-orange-500 font-bold text-xl">{formatPrice(price)}</span>
          <button
            onClick={() => addItem(id)}
            style={oswald}
            className={`px-4 py-2 text-sm tracking-widest uppercase transition-all ${
              inCart
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
          >
            {inCart ? `IN CART (${inCart.qty})` : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Cart Summary Sidebar ─── */
function CartSummary() {
  const {
    items, updateQty, removeItem, subtotal, discount, shippingCost,
    total, promoCode, setPromoCode, appliedPromo, hasLargeItem,
  } = useCart();

  return (
    <div className="bg-zinc-950 border border-white/10 p-6 sticky top-6">
      <h2 style={oswald} className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-3 mb-4">
        Your Cart
      </h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">Your cart is empty. Add items above.</p>
      ) : (
        <>
          {/* Cart items */}
          <div className="space-y-4 mb-6">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex gap-3">
                <img src={product.image} alt={product.name} className="w-16 h-16 object-contain bg-white p-1 border border-white/10 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p style={oswald} className="text-white font-bold text-sm tracking-wide truncate">{product.name}</p>
                  <p className="text-orange-500 text-sm font-bold">{formatPrice(product.price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQty(product.id, qty - 1)}
                      className="w-6 h-6 border border-white/20 text-white text-xs hover:border-orange-500 transition-colors flex items-center justify-center">−</button>
                    <span className="text-white text-sm w-4 text-center">{qty}</span>
                    <button onClick={() => updateQty(product.id, qty + 1)}
                      className="w-6 h-6 border border-white/20 text-white text-xs hover:border-orange-500 transition-colors flex items-center justify-center">+</button>
                    <button onClick={() => removeItem(product.id)}
                      className="text-gray-600 hover:text-red-400 text-xs ml-auto transition-colors">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Promo code */}
          <div className="mb-4">
            <label className="text-gray-500 text-xs tracking-widest uppercase block mb-1">Promo Code</label>
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter code"
              className="w-full bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-3 py-2 text-sm outline-none transition-colors"
            />
            {appliedPromo && (
              <p className="text-green-400 text-xs mt-1">{appliedPromo.label}</p>
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-white/10 pt-4 space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Discount</span>
                <span>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-400">
              <span>Shipping</span>
              {shippingCost === null ? (
                <span className="text-amber-400 text-xs">
                  {hasLargeItem ? "Calculated at checkout" : "—"}
                </span>
              ) : (
                <span>{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
              )}
            </div>
            <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-white/10" style={oswald}>
              <span>TOTAL</span>
              <span className="text-orange-500">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="space-y-2">
            {[
              { icon: "✓", text: "30-Day Guarantee" },
              { icon: "✓", text: "Durable & Portable" },
              { icon: "🔒", text: "Secure Checkout" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-gray-500 text-xs tracking-widest">
                <span className="text-orange-500">{icon}</span> {text}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Checkout Form (inside Stripe Elements) ─── */
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { total, items } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "affirm">("card");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setError(null);

    try {
      // Create PaymentIntent on server
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ id: i.product.id, qty: i.qty })),
          shipping: {
            name: `${form.firstName} ${form.lastName}`,
            address: form.address,
            city: form.city,
            state: form.state,
            zip: form.zip,
          },
          email: form.email,
          paymentMethod,
        }),
      });

      const { clientSecret, error: serverError } = await res.json();
      if (serverError) {
        setError(serverError);
        setIsProcessing(false);
        return;
      }

      // Confirm payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order/confirmation`,
          receipt_email: form.email,
          shipping: {
            name: `${form.firstName} ${form.lastName}`,
            address: {
              line1: form.address,
              city: form.city,
              state: form.state,
              postal_code: form.zip,
              country: "US",
            },
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Payment failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Contact */}
      <div>
        <h2 style={oswald} className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-3 mb-5">
          01 — Contact Information
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <input name="firstName" placeholder="First Name" value={form.firstName} onChange={handle}
            className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors" required />
          <input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handle}
            className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors" required />
          <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handle}
            className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-2" required />
          <input name="phone" type="tel" placeholder="Phone (optional)" value={form.phone} onChange={handle}
            className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-2" />
        </div>
      </div>

      {/* Shipping */}
      <div>
        <h2 style={oswald} className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-3 mb-5">
          02 — Shipping Address
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <input name="address" placeholder="Street Address" value={form.address} onChange={handle}
            className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-2" required />
          <input name="city" placeholder="City" value={form.city} onChange={handle}
            className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors" required />
          <select name="state" value={form.state} onChange={handle}
            className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors" required>
            <option value="">State</option>
            {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input name="zip" placeholder="ZIP Code" value={form.zip} onChange={handle}
            className="bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-4 py-3 text-sm outline-none transition-colors col-span-2" required />
        </div>
      </div>

      {/* Payment Method Toggle */}
      <div>
        <h2 style={oswald} className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-3 mb-5">
          03 — Payment
        </h2>

        <div className="flex gap-3 mb-5">
          <button type="button" onClick={() => setPaymentMethod("card")}
            className={`flex-1 py-3 text-sm tracking-widest uppercase border transition-all ${
              paymentMethod === "card"
                ? "border-orange-500 bg-orange-500/10 text-orange-500"
                : "border-white/10 text-gray-400 hover:border-white/30"
            }`} style={oswald}>
            Credit / Debit Card
          </button>
          <button type="button" onClick={() => setPaymentMethod("affirm")}
            className={`flex-1 py-3 text-sm tracking-widest uppercase border transition-all ${
              paymentMethod === "affirm"
                ? "border-orange-500 bg-orange-500/10 text-orange-500"
                : "border-white/10 text-gray-400 hover:border-white/30"
            }`} style={oswald}>
            Affirm — Pay Later
          </button>
        </div>

        {paymentMethod === "affirm" && (
          <div className="border border-blue-500/30 bg-blue-500/5 p-4 mb-5 text-sm text-blue-300">
            Pay over time with Affirm. You'll be redirected to Affirm to complete your purchase after clicking "Place Order."
          </div>
        )}

        {/* Stripe Payment Element */}
        <div className="bg-zinc-900 border border-white/10 p-4 rounded">
          <PaymentElement
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  name: `${form.firstName} ${form.lastName}`,
                  email: form.email,
                  phone: form.phone,
                  address: {
                    line1: form.address,
                    city: form.city,
                    state: form.state,
                    postal_code: form.zip,
                    country: "US",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="border border-red-500/50 bg-red-500/10 p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || items.length === 0}
        style={oswald}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-5 text-xl tracking-widest uppercase transition-all hover:scale-[1.01] shadow-lg shadow-orange-500/20"
      >
        {isProcessing ? "PROCESSING..." : `PLACE ORDER — ${formatPrice(total)}`}
      </button>

      <p className="text-gray-600 text-xs text-center tracking-wide">
        Your payment info is encrypted and secure. We never store card details.
      </p>
    </form>
  );
}

/* ─── Main Order Page ─── */
export default function OrderPage() {
  const { items, total } = useCart();

  return (
    <div className="bg-black min-h-screen">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-black/95 px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" style={oswald} className="text-white font-bold tracking-widest hover:text-orange-500 transition-colors">
          &larr; SULTAN <span className="text-orange-500">OF SWING</span>
        </Link>
        <div className="flex items-center gap-2 text-gray-400 text-xs tracking-widest">
          <span className="text-orange-500">🔒</span> SECURE CHECKOUT
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ── SHOP SECTION ── */}
        <div className="mb-16">
          <p className="text-orange-500 text-xs tracking-[0.4em] uppercase mb-2" style={oswald}>OFFICIAL GEAR</p>
          <h1 style={oswald} className="text-4xl font-bold uppercase mb-2">SHOP</h1>
          <p className="text-gray-500 text-sm mb-8 tracking-widest">Select your training equipment below</p>

          {/* Main units */}
          <h3 style={oswald} className="text-sm text-gray-400 tracking-widest uppercase mb-4 border-b border-white/10 pb-2">
            Training Systems
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {PRODUCTS.filter((p) => p.category === "main").map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>

          {/* Accessories */}
          <h3 style={oswald} className="text-sm text-gray-400 tracking-widest uppercase mb-4 border-b border-white/10 pb-2">
            Accessories & Replacement Parts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PRODUCTS.filter((p) => p.category === "accessory").map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>

        {/* ── CHECKOUT SECTION ── */}
        {items.length > 0 && (
          <>
            <div className="w-full h-px bg-white/10 mb-12" />
            <div id="checkout">
              <p className="text-orange-500 text-xs tracking-[0.4em] uppercase mb-2" style={oswald}>ALMOST THERE</p>
              <h2 style={oswald} className="text-4xl font-bold uppercase mb-2">CHECKOUT</h2>
              <p className="text-gray-500 text-sm mb-10 tracking-widest">Complete your purchase below</p>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-3">
                  <Elements
                    stripe={stripePromise}
                    options={{
                      mode: "payment",
                      amount: total || 100,
                      currency: "usd",
                      appearance: {
                        theme: "night",
                        variables: {
                          colorPrimary: "#f97316",
                          colorBackground: "#18181b",
                          colorText: "#ffffff",
                          colorDanger: "#ef4444",
                          borderRadius: "0px",
                          fontFamily: "Inter, sans-serif",
                        },
                      },
                      paymentMethodTypes: ["card", "affirm"],
                    }}
                  >
                    <CheckoutForm />
                  </Elements>
                </div>
                <div className="lg:col-span-2">
                  <CartSummary />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Show cart summary when no items in checkout mode */}
        {items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg" style={oswald}>YOUR CART IS EMPTY</p>
            <p className="text-gray-600 text-sm mt-2">Add items above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
