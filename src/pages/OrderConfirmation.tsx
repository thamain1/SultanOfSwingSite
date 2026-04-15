import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../lib/cart";

const oswald = { fontFamily: "Oswald, sans-serif" };

export default function OrderConfirmation() {
  const [params] = useSearchParams();
  const { clearCart } = useCart();
  const paymentIntent = params.get("payment_intent");
  const status = params.get("redirect_status");

  // Clear the cart on successful payment
  useEffect(() => {
    if (status === "succeeded") {
      clearCart();
    }
  }, [status, clearCart]);

  const isSuccess = status === "succeeded";

  return (
    <div className="bg-black min-h-screen">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-black/95 px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" style={oswald} className="text-white font-bold tracking-widest hover:text-orange-500 transition-colors">
          &larr; SULTAN <span className="text-orange-500">OF SWING</span>
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
    </div>
  );
}
