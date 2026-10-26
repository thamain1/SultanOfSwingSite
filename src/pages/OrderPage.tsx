import { Link } from "react-router-dom";
import { PRODUCTS } from "../lib/products";
import { SALES_PHONE, SALES_EMAIL, pricingMailto } from "../lib/contact";
import Footer from "../components/Footer";

const oswald = { fontFamily: "Oswald, sans-serif" };

// Online ordering is off: pricing and orders are by phone or email only. The full
// cart + Stripe checkout is kept, unimported, in src/checkout/Checkout.tsx.

/* ─── Product Card ─── */
function ProductCard({ name, model, image, description, category }: {
  name: string; model: string;
  image: string; description: string; category: string;
}) {
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
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 gap-2">
          <a
            href={`tel:${SALES_PHONE.tel}`}
            style={oswald}
            className="block text-center px-4 py-2 text-sm tracking-widest uppercase transition-all border border-orange-500 bg-orange-500 hover:bg-orange-600 hover:border-orange-600 text-white"
          >
            Call for Pricing
          </a>
          <a
            href={pricingMailto(name)}
            style={oswald}
            className="block text-center px-4 py-2 text-sm tracking-widest uppercase transition-all border border-orange-500 text-orange-500 hover:bg-orange-500/10"
          >
            Email for Pricing
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Order Page ─── */
export default function OrderPage() {
  return (
    <div className="bg-black min-h-screen">
      {/* Top bar */}
      <div className="border-b border-white/10 bg-black/95 px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-white text-lg">&larr;</span>
          <img src="/assets/sultan-logo.png" alt="Sultan of Swing" className="h-10" />
        </Link>
        <a href={`tel:${SALES_PHONE.tel}`} className="flex items-center gap-2 text-gray-400 hover:text-white text-xs tracking-widest transition-colors">
          <span className="text-orange-500">☎</span> {SALES_PHONE.display}
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ── SHOP SECTION ── */}
        <div className="mb-16">
          <p className="text-orange-500 text-xs tracking-[0.4em] uppercase mb-2" style={oswald}>OFFICIAL GEAR</p>
          <h1 style={oswald} className="text-4xl font-bold uppercase mb-2">SHOP</h1>
          <p className="text-gray-500 text-sm mb-6 tracking-widest">Browse our training equipment below</p>

          {/* Call for pricing */}
          <div className="border border-orange-500/40 border-l-2 border-l-orange-500 bg-gradient-to-r from-orange-500/10 to-transparent p-5 mb-10 max-w-2xl">
            <p style={oswald} className="text-white text-sm font-bold uppercase tracking-[0.2em] mb-2">
              Call or Email for Pricing
            </p>
            <p className="text-gray-300 text-sm leading-relaxed">
              For pricing and to place an order, give us a call at{" "}
              <a href={`tel:${SALES_PHONE.tel}`} style={oswald} className="text-orange-500 hover:text-orange-400 tracking-widest whitespace-nowrap">
                {SALES_PHONE.display}
              </a>{" "}
              or email{" "}
              <a href={pricingMailto()} className="text-orange-500 hover:text-orange-400 break-words">
                {SALES_EMAIL}
              </a>
              .
            </p>
          </div>

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
      </div>

      <Footer />
    </div>
  );
}
