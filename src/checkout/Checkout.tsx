/* ─── Online checkout (LIVE) ───
   Online ordering is back on (WO 0001). The routes are wrapped in
   <CartProvider> (App.tsx), <CheckoutSection /> renders below the shop in
   pages/OrderPage.tsx, shop cards add to the cart, and the confirmation page
   clears it. Pay by card, Affirm or Klarna. Prices, the PLATOS#1 promo and the
   cart math live in shared/pricing.ts, the same code the Pages Functions use to
   set the charge; shipping is quoted and re-checked server-side. */
import { useState, useEffect, useRef, Component, type ReactNode } from "react";
import {
  Elements,
  PaymentElement,
  PaymentMethodMessagingElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "../lib/stripe";
import { useCart } from "../lib/cart";
import { PROMO_CODE, formatPrice, isValidStateCode, isValidZip, unitPrice, zipMatchesState } from "../lib/pricing";

const oswald = { fontFamily: "Oswald, sans-serif" };

// Affirm supports USD transactions from $35.00 to $30,000.00.
// Below the floor Stripe rejects the PaymentIntent, so don't offer it.
const AFFIRM_MIN_CENTS = 3500;

// Stripe error codes meaning "Klarna cannot be used for this order". Any other
// Klarna error (network, validation) shows its real message and keeps Klarna selected.
const KLARNA_UNAVAILABLE_CODES = new Set([
  "payment_method_not_available",
  "payment_method_provider_decline",
  "payment_method_unactivated",
  "payment_method_currency_mismatch",
  "amount_too_small",
  "amount_too_large",
]);

/* ─── Failure-isolating boundary ───
   The Affirm / Klarna promo messaging is a nice-to-have. If Stripe.js throws while
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

/* ─── Affirm + Klarna promotional messaging ───
   Stripe-hosted element that renders each provider's own estimated monthly
   payment and disclosures, which keeps us inside their marketing-compliance
   rules instead of hardcoding a rate or term we can't substantiate. Stripe
   shows only the providers the amount qualifies for.
   Mounted in its own Elements group: the checkout group is created in
   deferred-intent `mode`, which doesn't support this element type. */
function PaymentMessaging({ amount }: { amount: number }) {
  return (
    <QuietBoundary>
      <Elements stripe={stripePromise}>
        <PaymentMethodMessagingElement
          options={{
            amount,
            currency: "USD",
            countryCode: "US",
            paymentMethodTypes: ["affirm", "klarna"],
            logoColor: "white",
          }}
        />
      </Elements>
    </QuietBoundary>
  );
}

/* ─── Cart Summary Sidebar ─── */
function CartSummary() {
  const {
    items, updateQty, removeItem, subtotal, discount, shippingCost,
    total, promoCode, setPromoCode, appliedPromo, hasLargeItem, locked,
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
                  <p className="text-orange-500 text-sm font-bold">
                    {appliedPromo && unitPrice(product.id, true) !== unitPrice(product.id, false) && (
                      <span className="text-gray-500 line-through font-normal mr-2">{formatPrice(unitPrice(product.id, false))}</span>
                    )}
                    {formatPrice(unitPrice(product.id, appliedPromo !== null))}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQty(product.id, qty - 1)} disabled={locked} aria-label={`Decrease ${product.name}`}
                      className="w-6 h-6 border border-white/20 text-white text-xs hover:border-orange-500 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">−</button>
                    <span className="text-white text-sm w-4 text-center">{qty}</span>
                    <button onClick={() => updateQty(product.id, qty + 1)} disabled={locked} aria-label={`Increase ${product.name}`}
                      className="w-6 h-6 border border-white/20 text-white text-xs hover:border-orange-500 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">+</button>
                    <button onClick={() => removeItem(product.id)} disabled={locked}
                      className="text-gray-600 hover:text-red-400 text-xs ml-auto transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Remove</button>
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
              autoComplete="off"
              disabled={locked}
              className="w-full bg-zinc-900 border border-white/10 focus:border-orange-500 text-white px-3 py-2 text-sm outline-none transition-colors"
            />
            {appliedPromo ? (
              <p className="text-green-400 text-xs mt-1">{appliedPromo.label}</p>
            ) : (
              <p className="text-gray-500 text-xs mt-1">Have a code? Try {PROMO_CODE}</p>
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
  const { total, items, shippingCost, promoCode, setShippingCost, hasLargeItem, locked, setLocked, subtotal, discount } = useCart();
  const isProcessing = locked; // the cart is frozen while a payment is being created or confirmed
  const setIsProcessing = setLocked;
  const [error, setError] = useState<string | null>(null);
  // The destination key whose shipping quote failed (shown with a Retry button).
  const [quoteFailedKey, setQuoteFailedKey] = useState("");
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<"card" | "affirm" | "klarna">("card");
  const lastQuoteKeyRef = useRef("");

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
  const paymentMethod =
    paymentMethodChoice === "affirm" && !affirmEligible ? "card" : paymentMethodChoice;

  // Coming back from an Affirm / Klarna page with the browser Back button can restore
  // this page from the back-forward cache mid-payment: unfreeze the cart and form.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLocked(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, [setLocked]);

  // Large items need a FedEx quote for this ZIP + state + cart.
  const zipTrim = form.zip.trim();
  const destinationValid = isValidStateCode(form.state) && isValidZip(zipTrim) && zipMatchesState(zipTrim, form.state);
  const quoteKey = `${zipTrim}|${form.state}|${items.map((i) => `${i.product.id}x${i.qty}`).join(",")}`;
  const quoteFailed = hasLargeItem && destinationValid && quoteFailedKey === quoteKey;
  const quoteLoading = hasLargeItem && destinationValid && shippingCost === null && !quoteFailed;

  useEffect(() => {
    if (!hasLargeItem) return;
    if (!destinationValid) {
      // ZIP or state is no longer usable: forget the quote so a stale number is never shown or sent.
      if (lastQuoteKeyRef.current !== "") {
        lastQuoteKeyRef.current = "";
        setShippingCost(null);
      }
      return;
    }
    // Re-quote when the destination OR the cart changes (a cart edit clears the
    // shown shipping, so the same ZIP must be quoted again). A key is remembered
    // only after a successful quote, so a cancelled or failed request is retried.
    if ((quoteKey === lastQuoteKeyRef.current && shippingCost !== null) || quoteKey === quoteFailedKey) return;

    const controller = new AbortController();
    fetch("/api/calculate-shipping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.product.id, qty: i.qty })),
        destination: { zip: zipTrim, state: form.state },
      }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = (await res.json()) as { total?: unknown };
        if (!res.ok || typeof data.total !== "number") throw new Error("quote failed");
        return data.total;
      })
      .then((quoted) => {
        lastQuoteKeyRef.current = quoteKey;
        setQuoteFailedKey("");
        setShippingCost(quoted);
      })
      .catch(() => {
        if (controller.signal.aborted) return; // superseded by a newer quote: do not flag an error
        lastQuoteKeyRef.current = "";
        setQuoteFailedKey(quoteKey);
      });

    return () => controller.abort();
  }, [quoteKey, quoteFailedKey, destinationValid, hasLargeItem, items, zipTrim, form.state, shippingCost, setShippingCost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || isProcessing) return;
    if (!destinationValid) {
      setError("Please enter a valid ZIP code and state. The ZIP code must belong to the state you chose.");
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      // Card path validates the PaymentElement; Affirm and Klarna have no inline form.
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
            zip: zipTrim,
          },
          email: form.email,
          phone: form.phone,
          promoCode,
          paymentMethod,
          shippingTotal: shippingCost,
        }),
      });

      const created = await res.json();
      const { clientSecret, error: serverError } = created;

      // The server computed a different shipping amount than the one shown.
      // Show the server's number and make the shopper press pay again, so a
      // total they did not see is never charged.
      if (res.status === 409 && typeof created.shipping === "number") {
        setShippingCost(created.shipping);
        setError(
          `Shipping for this order is ${formatPrice(created.shipping)}. Your total was updated. Please review it and press Place Order again.`,
        );
        setIsProcessing(false);
        return;
      }

      if (serverError || !clientSecret) {
        setError(serverError || "Could not start your payment. Please try again.");
        setIsProcessing(false);
        return;
      }

      // Confirm payment: branch by method since Affirm and Klarna have no PaymentElement
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
          : paymentMethod === "klarna"
          ? await stripe.confirmKlarnaPayment(clientSecret, {
              payment_method: {
                billing_details: {
                  name: billingDetails.name,
                  email: billingDetails.email,
                  address: { country: "US" },
                },
              },
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
        if (paymentMethod === "klarna" && stripeError.code && KLARNA_UNAVAILABLE_CODES.has(stripeError.code)) {
          // Stripe says Klarna cannot take this order (not eligible or declined): send the shopper back to card.
          setPaymentMethodChoice("card");
          setError(
            `${stripeError.message || "Klarna is not available for this order."} You can pay by card or Affirm instead.`,
          );
        } else {
          setError(stripeError.message || "Payment failed. Please try again.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Frozen while a payment is being created or confirmed (the cart is locked too). */}
      <fieldset disabled={isProcessing} className="space-y-8 min-w-0">
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
            Pay in full today, or split your order into payments with Affirm or Klarna. You will see
            the available plans and the payment amounts from the provider before your order is
            final.
          </p>
          {affirmEligible && (
            <div className="mt-3">
              <PaymentMessaging amount={total} />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
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

          <button type="button" onClick={() => setPaymentMethodChoice("klarna")}
            aria-pressed={paymentMethod === "klarna"}
            className={`text-left p-4 border transition-all ${
              paymentMethod === "klarna"
                ? "border-orange-500 bg-orange-500/10"
                : "border-white/10 hover:border-white/30"
            }`}>
            <span className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                paymentMethod === "klarna" ? "border-orange-500 bg-orange-500" : "border-white/30"
              }`} />
              <span style={oswald} className={`text-sm tracking-widest uppercase ${
                paymentMethod === "klarna" ? "text-orange-500" : "text-gray-300"
              }`}>
                Pay with Klarna
              </span>
            </span>
            <span className="block text-gray-500 text-xs mt-2 pl-5">Pay over time with Klarna.</span>
          </button>
        </div>

        {/* Stripe Payment Element: only mounted for the Card path. Affirm and
            Klarna collect everything on their own pages after redirect. */}
        {paymentMethod === "card" && (
          <div className="bg-zinc-900 border border-white/10 p-4 rounded">
            <PaymentElement
              options={{
                layout: "tabs",
                paymentMethodOrder: ["card"],
                wallets: { link: "never" },
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

        {paymentMethod === "klarna" && (
          <div className="bg-zinc-900 border border-orange-500/30 p-6 rounded">
            <p style={oswald} className="text-white text-xs tracking-widest uppercase mb-3">
              How Klarna works
            </p>
            <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
              <li>No card details needed on this page.</li>
              <li>
                Click <span className="text-orange-500 font-semibold">Place Order</span> below to
                continue to Klarna.
              </li>
              <li>Choose the payment option that fits, then confirm to finish your order.</li>
            </ol>
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
            quoteFailed ? (
              <span className="text-red-400 text-xs text-right">
                Couldn&apos;t get shipping.{" "}
                <button
                  type="button"
                  onClick={() => setQuoteFailedKey("")}
                  className="text-orange-500 hover:text-orange-400 underline tracking-widest uppercase"
                >
                  Retry
                </button>
              </span>
            ) : quoteLoading ? (
              <span className="text-amber-400 text-xs">Calculating shipping...</span>
            ) : (
              <span className="text-amber-400 text-xs">
                {hasLargeItem && (form.zip || form.state) && !destinationValid
                  ? "Enter a valid ZIP and state"
                  : "Enter ZIP above to calculate"}
              </span>
            )
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
          ? quoteLoading
            ? "CALCULATING SHIPPING..."
            : quoteFailed
            ? "SHIPPING QUOTE NEEDED"
            : "ENTER ZIP TO CONTINUE"
          : `PLACE ORDER — ${formatPrice(total)}`}
      </button>

      <p className="text-gray-600 text-xs text-center tracking-wide">
        Your payment info is encrypted and secure. We never store card details.
      </p>
      </fieldset>
    </form>
  );
}

/* ─── Checkout section: checkout form + cart sidebar ─── */
export function CheckoutSection() {
  const { items, total } = useCart();
  if (items.length === 0) return null;

  return (
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
                // The card panel shows cards only. Affirm and Klarna use their own
                // confirm calls on the server-created intent; their messaging
                // lives in a separate Elements group (PaymentMessaging).
                paymentMethodTypes: ["card"],
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
  );
}
