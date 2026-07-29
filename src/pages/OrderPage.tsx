import { useState, useEffect, useRef, Component, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Elements,
  PaymentElement,
  PaymentMethodMessagingElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "../lib/stripe";
import { useCart } from "../lib/cart";
import { PRODUCTS, formatPrice } from "../lib/products";
import Footer from "../components/Footer";

const oswald = { fontFamily: "Oswald, sans-serif" };

// Affirm supports USD transactions from $35.00 to $30,000.00.
// Below the floor Stripe rejects the PaymentIntent, so don't offer it.
const AFFIRM_MIN_CENTS = 3500;

/* ─── Failure-isolating boundary ───
   Affirm's promo messaging is a nice-to-have. If Stripe.js throws while
   creating that element, the boundary swallows it so the checkout form
   itself keeps rendering. */
class QuietBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ─── Affirm promotional messaging ───
   Stripe-hosted element that renders Affirm's own estimated monthly payment
   and disclosures, which keeps us inside Affirm's marketing-compliance rules
   instead of hardcoding a rate or term we can't substantiate.
   Mounted in its own Elements group: the checkout group is created in
   deferred-intent `mode`, which doesn't support this element type. */
function AffirmMessaging({ amount }: { amount: number }) {
  return (
    <QuietBoundary>
      <Elements stripe={stripePromise}>
        <PaymentMethodMessagingElement
          options={{
            amount,
            currency: "USD",
            countryCode: "US",
            paymentMethodTypes: ["affirm"],
            logoColor: "white",
          }}
        />
      </Elements>
    </QuietBoundary>
  );
}

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
  const { total, items, subtotal, discount, shippingCost, promoCode, setShippingCost, hasLargeItem } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<"card" | "affirm">("card");
  const lastZipRef = useRef("");

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const affirmEligible = total >= AFFIRM_MIN_CENTS;

  // Derived, not synced: if the cart drops below Affirm's floor while Affirm is
  // selected, the effective method falls back to card immediately, so we can
  // never submit a method Stripe would reject.
  const paymentMethod = affirmEligible ? paymentMethodChoice : "card";

  // Fetch FedEx shipping rate when ZIP + state are filled for large items
  useEffect(() => {
    if (!hasLargeItem || form.zip.length < 5 || !form.state) return;
    if (form.zip === lastZipRef.current) return;
    lastZipRef.current = form.zip;

    const controller = new AbortController();
    fetch("/api/calculate-shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.product.id, qty: i.qty })),
        destination: { zip: form.zip, state: form.state },
      }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: { total?: number }) => {
        if (typeof data.total === "number") {
          setShippingCost(data.total);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [form.zip, form.state, hasLargeItem, items, setShippingCost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setError(null);

    try {
      // Card path validates the PaymentElement; Affirm has no inline form.
      if (paymentMethod === "card") {
        const { error: submitError } = await elements.submit();
        if (submitError) {
          setError(submitError.message || "Please check your payment details.");
          setIsProcessing(false);
          return;
        }
      }

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
          phone: form.phone,
          promoCode,
          paymentMethod,
          shippingTotal: shippingCost,
        }),
      });

      const { clientSecret, error: serverError } = await res.json();
      if (serverError) {
        setError(serverError);
        setIsProcessing(false);
        return;
      }

      // Confirm payment — branch by method since Affirm has no PaymentElement
      const returnUrl = `${window.location.origin}/order/confirmation`;
      const billingDetails = {
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
      };

      const { error: stripeError } =
        paymentMethod === "affirm"
          ? await stripe.confirmAffirmPayment(clientSecret, {
              payment_method: { billing_details: billingDetails },
              return_url: returnUrl,
            })
          : await stripe.confirmPayment({
              elements,
              clientSecret,
              confirmParams: {
                return_url: returnUrl,
                receipt_email: form.email,
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

        {/* Flexible payment options — surfaces Affirm before the method choice */}
        <div className="border border-orange-500/40 border-l-2 border-l-orange-500 bg-gradient-to-r from-orange-500/10 to-transparent p-5 mb-6">
          <p style={oswald} className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-2">
            Flexible Payment Options
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Pay in full today, or split your order into monthly payments with Affirm. You will see
            the available plans, your rate, and the monthly amount from Affirm before your order is
            final.
          </p>
          {affirmEligible && (
            <div className="mt-3">
              <AffirmMessaging amount={total} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button type="button" onClick={() => setPaymentMethodChoice("card")}
            aria-pressed={paymentMethod === "card"}
            className={`text-left p-4 border transition-all ${
              paymentMethod === "card"
                ? "border-orange-500 bg-orange-500/10"
                : "border-white/10 hover:border-white/30"
            }`}>
            <span className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                paymentMethod === "card" ? "border-orange-500 bg-orange-500" : "border-white/30"
              }`} />
              <span style={oswald} className={`text-sm tracking-widest uppercase ${
                paymentMethod === "card" ? "text-orange-500" : "text-gray-300"
              }`}>
                Credit / Debit Card
              </span>
            </span>
            <span className="block text-gray-500 text-xs mt-2 pl-5">Pay the full amount today.</span>
          </button>

          <button type="button" onClick={() => setPaymentMethodChoice("affirm")}
            aria-pressed={paymentMethod === "affirm"}
            disabled={!affirmEligible}
            className={`text-left p-4 border transition-all ${
              paymentMethod === "affirm"
                ? "border-orange-500 bg-orange-500/10"
                : affirmEligible
                ? "border-white/10 hover:border-white/30"
                : "border-white/10 opacity-50 cursor-not-allowed"
            }`}>
            <span className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                paymentMethod === "affirm" ? "border-orange-500 bg-orange-500" : "border-white/30"
              }`} />
              <span style={oswald} className={`text-sm tracking-widest uppercase ${
                paymentMethod === "affirm" ? "text-orange-500" : "text-gray-300"
              }`}>
                Pay Monthly with Affirm
              </span>
              <span style={oswald}
                className="ml-auto flex-shrink-0 bg-orange-500 text-black text-[10px] font-bold tracking-widest uppercase px-2 py-0.5">
                Flexible
              </span>
            </span>
            <span className="block text-gray-500 text-xs mt-2 pl-5">
              {affirmEligible
                ? "Split your total into monthly payments."
                : `Available on orders of ${formatPrice(AFFIRM_MIN_CENTS)} or more.`}
            </span>
          </button>
        </div>

        {/* Stripe Payment Element — only mounted for the Card path. Affirm
            collects everything on its own portal after redirect. */}
        {paymentMethod === "card" && (
          <div className="bg-zinc-900 border border-white/10 p-4 rounded">
            <PaymentElement
              options={{
                layout: "tabs",
                paymentMethodOrder: ["card"],
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
        )}

        {paymentMethod === "affirm" && (
          <div className="bg-zinc-900 border border-orange-500/30 p-6 rounded">
            <p style={oswald} className="text-white text-xs tracking-widest uppercase mb-3">
              How Affirm works
            </p>
            <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
              <li>No card details needed on this page.</li>
              <li>
                Click <span className="text-orange-500 font-semibold">Place Order</span> below to
                continue to Affirm.
              </li>
              <li>Choose the payment plan that fits, then confirm to finish your order.</li>
            </ol>
          </div>
        )}
      </div>

      {/* Order summary — shipping as a clear line item */}
      <div className="bg-zinc-900 border border-white/10 p-4 space-y-2">
        <h3 style={oswald} className="text-xs tracking-widest uppercase text-gray-400 border-b border-white/10 pb-2 mb-3">Order Summary</h3>
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
            <span className="text-amber-400 text-xs">Enter ZIP above to calculate</span>
          ) : (
            <span className="text-white">{shippingCost === 0 ? "FREE" : formatPrice(shippingCost)}</span>
          )}
        </div>
        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10" style={oswald}>
          <span>TOTAL</span>
          <span className="text-orange-500">{formatPrice(total)}</span>
        </div>
      </div>

      {error && (
        <div className="border border-red-500/50 bg-red-500/10 p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing || items.length === 0 || (hasLargeItem && shippingCost === null)}
        style={oswald}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-5 text-xl tracking-widest uppercase transition-all hover:scale-[1.01] shadow-lg shadow-orange-500/20"
      >
        {isProcessing
          ? "PROCESSING..."
          : shippingCost === null && hasLargeItem
          ? "ENTER ZIP TO CONTINUE"
          : `PLACE ORDER — ${formatPrice(total)}`}
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
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-white text-lg">&larr;</span>
          <img src="/assets/sultan-logo.png" alt="Sultan of Swing" className="h-10" />
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

      <Footer />
    </div>
  );
}
