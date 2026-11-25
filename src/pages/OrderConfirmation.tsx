import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import { useCart } from "../lib/cart";
import { SALES_PHONE } from "../lib/contact";

const oswald = { fontFamily: "Oswald, sans-serif" };

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const paymentIntent = params.get("payment_intent");
  const status = params.get("redirect_status");

  // Stripe's redirect_status: succeeded | processing | failed | requires_payment_method.
  // Only a failed attempt may say "no charges were made"; a processing payment may
  // still complete, and a missing or unknown status says nothing about charges.
  const isSuccess = status === "succeeded";
  const isProcessing = status === "processing";
  const isFailed = status === "failed" || status === "requires_payment_method" || status === "canceled";

  // Empty the cart once the order is confirmed.
  const { clearCart } = useCart();
  useEffect(() => {
    if (isSuccess) clearCart();
  }, [isSuccess, clearCart]);

  return (
    <div className="bg-black min-h-screen">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-black/95 px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-white text-lg">&larr;</span>
          <img src="/assets/sultan-logo.png" alt="Sultan of Swing" className="h-10" />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        {isSuccess ? (
          <>
            <div className="text-6xl mb-6">&#9989;</div>
            <h1 style={oswald} className="text-5xl font-bold uppercase mb-4">
              ORDER <span className="text-orange-500">CONFIRMED</span>
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              Thank you for your purchase! Your order is being processed.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              A confirmation email will be sent to your inbox shortly.
            </p>
            {paymentIntent && (
              <p className="text-gray-600 text-xs mb-8 font-mono">
                Order Reference: {paymentIntent}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                style={oswald}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 text-lg tracking-widest uppercase transition-all hover:scale-105"
              >
                BACK TO HOME
              </Link>
              <Link
                to="/order"
                style={oswald}
                className="border-2 border-white/40 hover:border-orange-500 text-white font-bold px-10 py-4 text-lg tracking-widest uppercase transition-all hover:text-orange-500"
              >
                SHOP MORE
              </Link>
            </div>
          </>
        ) : isProcessing ? (
          <>
            <div className="text-6xl mb-6">&#9203;</div>
            <h1 style={oswald} className="text-5xl font-bold uppercase mb-4">
              PAYMENT <span className="text-orange-500">PROCESSING</span>
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              Your payment is processing. We&apos;ll email you once it is confirmed.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              You do not need to place the order again.
            </p>
            {paymentIntent && (
              <p className="text-gray-600 text-xs mb-8 font-mono">
                Order Reference: {paymentIntent}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                style={oswald}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 text-lg tracking-widest uppercase transition-all hover:scale-105"
              >
                BACK TO HOME
              </Link>
            </div>
          </>
        ) : !isFailed ? (
          <>
            <h1 style={oswald} className="text-4xl font-bold uppercase mb-4">
              PAYMENT <span className="text-orange-500">STATUS</span>
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              We could not confirm the status of your payment.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              If you were charged, you will receive an email from us. Questions? Call{" "}
              <a href={`tel:${SALES_PHONE.tel}`} className="text-orange-500">{SALES_PHONE.display}</a>.
            </p>
            <Link
              to="/order"
              style={oswald}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 text-lg tracking-widest uppercase transition-all hover:scale-105 inline-block"
            >
              BACK TO SHOP
            </Link>
          </>
        ) : (
          <>
            <div className="text-6xl mb-6">&#10060;</div>
            <h1 style={oswald} className="text-5xl font-bold uppercase mb-4">
              PAYMENT <span className="text-red-500">ISSUE</span>
            </h1>
            <p className="text-gray-400 text-lg mb-2">
              Your payment could not be completed.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              No charges were made. Please try again or use a different payment method.
            </p>
            <Link
              to="/order"
              style={oswald}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 text-lg tracking-widest uppercase transition-all hover:scale-105 inline-block"
            >
              TRY AGAIN
            </Link>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
