import { Link } from "react-router-dom";
import { PRODUCTS, type Product } from "../lib/products";
import { SALES_PHONE, SALES_EMAIL, contactMailto } from "../lib/contact";
import { useCart } from "../lib/cart";
import { PRICE_TABLE, PROMO_CODE, STAND_PROMO_PRICE, formatDollars, formatPrice } from "../lib/pricing";
import { CheckoutSection } from "../checkout/Checkout";
import Footer from "../components/Footer";
import { HolidayBanner, HolidayRibbon } from "../components/Holiday";
import { isHolidayActive } from "../../shared/holiday.ts";

const oswald = { fontFamily: "Oswald, sans-serif" };

/* ─── Product Card ─── */
function ProductCard({ id, name, model, image, description, category }: Product) {
  const { addItem, items, locked } = useCart();
  const price = PRICE_TABLE[id];
  const inCart = items.find((i) => i.product.id === id)?.qty ?? 0;
  const hasPromoPrice = price.promoPrice !== undefined;

  return (
    <div className={`border bg-zinc-950 hover:border-orange-500/50 transition-all group flex flex-col ${
      hasPromoPrice && isHolidayActive() ? "border-orange-500/50" : "border-white/10"
    }`}>
      <div className="relative overflow-hidden bg-white">
        <img src={image} alt={name} className="w-full h-48 object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
        {category === "main" && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] tracking-widest px-2 py-0.5 uppercase" style={oswald}>
            Main Unit
          </div>
        )}
        {hasPromoPrice && <HolidayRibbon />}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-gray-500 text-[10px] tracking-widest uppercase">{model}</p>
        <h3 style={oswald} className="text-white font-bold tracking-wide mt-1 text-lg leading-tight">{name}</h3>
        <p className="text-gray-400 text-xs mt-2 leading-relaxed flex-1">{description}</p>
        <div className="mt-4 pt-4 border-t border-white/10">
          {hasPromoPrice ? (
            <div className="mb-3">
              <p style={oswald} className="text-gray-500 text-lg tracking-wide line-through">{formatPrice(price.price)}</p>
              <p style={oswald} className="text-orange-500 text-sm font-bold tracking-widest uppercase">
                {formatDollars(STAND_PROMO_PRICE)} with code {PROMO_CODE}
              </p>
            </div>
          ) : (
            <p style={oswald} className="text-white text-lg tracking-wide mb-3">{formatPrice(price.price)}</p>
          )}
          <button
            type="button"
            onClick={() => addItem(id)}
            disabled={locked}
            style={oswald}
            className="block w-full text-center px-4 py-2 text-sm tracking-widest uppercase transition-all border border-orange-500 bg-orange-500 hover:bg-orange-600 hover:border-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
          {inCart > 0 && (
            <a href="#checkout" className="block text-center text-xs text-orange-500 hover:text-orange-400 mt-2 tracking-widest">
              {inCart} in cart. Go to checkout
            </a>
          )}
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
          <HolidayBanner />
          <p className="text-orange-500 text-xs tracking-[0.4em] uppercase mb-2" style={oswald}>OFFICIAL GEAR</p>
          <h1 style={oswald} className="text-4xl font-bold uppercase mb-2">SHOP</h1>
          <p className="text-gray-500 text-sm mb-6 tracking-widest">Browse our training equipment below</p>

          {/* Questions */}
          <p className="text-gray-400 text-xs leading-relaxed mb-10 max-w-2xl">
            Questions? Call{" "}
            <a href={`tel:${SALES_PHONE.tel}`} style={oswald} className="text-orange-500 hover:text-orange-400 tracking-widest whitespace-nowrap">
              {SALES_PHONE.display}
            </a>{" "}
            or email{" "}
            <a href={contactMailto()} className="text-orange-500 hover:text-orange-400 break-words">
              {SALES_EMAIL}
            </a>
            .
          </p>

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
            Accessories &amp; Replacement Parts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {PRODUCTS.filter((p) => p.category === "accessory").map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>

        {/* ── CHECKOUT (renders once the cart has items) ── */}
        <CheckoutSection />
      </div>

      <Footer />
    </div>
  );
}
