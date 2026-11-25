import { Link } from "react-router-dom";
import { isHolidayActive } from "../../shared/holiday.ts";
import { PROMO_CODE, STAND_PROMO_PRICE, formatDollars } from "../lib/pricing";

// Holiday look (WO 0001, matches mockups/holiday-shop.html). Every piece renders
// only while isHolidayActive() is true (see shared/holiday.ts for the end date).
// The $350 PLATOS#1 price itself does not expire; only this look does.
// No delivery-date promises in any copy here.

const oswald = { fontFamily: "Oswald, sans-serif" };

const RED = "#b4232c";
const PINE = "#1f6b3a";
const CANDY_STRIPE = `repeating-linear-gradient(135deg, ${RED} 0 12px, #f4f4f4 12px 24px, ${PINE} 24px 36px, #f4f4f4 36px 48px)`;

/** Light CSS snowfall. Hidden for prefers-reduced-motion (see index.css). */
function Snow({ count = 22 }: { count?: number }) {
  return (
    <div className="holiday-snow absolute inset-0 pointer-events-none" aria-hidden="true">
      {Array.from({ length: count }, (_, k) => (
        <i
          key={k}
          style={{
            left: `${(k * 37 + 11) % 100}%`,
            width: 3 + (k % 3),
            height: 3 + (k % 3),
            animationDuration: `${5 + (k % 5)}s`,
            animationDelay: `-${((k * 1.3) % 7).toFixed(1)}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Banner at the top of the shop. */
export function HolidayBanner() {
  if (!isHolidayActive()) return null;
  return (
    <div
      className="relative overflow-hidden border border-orange-500/40 bg-[#0b0b0b] px-4 sm:px-7 py-5 sm:py-7 mb-8"
      style={{ backgroundImage: `linear-gradient(120deg, rgba(180,35,44,.30), rgba(0,0,0,0) 55%)` }}
    >
      <div className="absolute left-0 right-0 top-0 h-1.5" style={{ background: CANDY_STRIPE }} aria-hidden="true" />
      <Snow />
      <div className="relative">
        <p style={{ ...oswald, color: "#4ade80" }} className="tracking-[0.4em] text-[11px] uppercase mt-1.5">
          The perfect gift
        </p>
        <h2 style={oswald} className="text-3xl sm:text-5xl leading-[1.05] font-bold uppercase my-2">
          Give the gift of a <span className="text-orange-500">better swing</span>
        </h2>
        <p className="text-zinc-300 text-sm leading-relaxed max-w-2xl">
          Sultan Softball and Sultan Baseball stands are <b>{formatDollars(STAND_PROMO_PRICE)} each</b> with code{" "}
          <span style={oswald} className="inline-block bg-orange-500 text-black font-bold tracking-[0.15em] px-2.5">
            {PROMO_CODE}
          </span>
          . Pay by card, or split it up with Affirm or Klarna.
        </p>
      </div>
    </div>
  );
}

/**
 * Slim strip on the landing page, linking to /order. Rendered in flow above the
 * hero, under the fixed navbar (the pt-16 wrapper is the navbar's height), so it
 * never covers an existing element. Renders nothing after the holiday ends.
 */
export function HolidayStrip() {
  if (!isHolidayActive()) return null;
  return (
    <div className="pt-16 bg-black">
      <div
        className="flex items-center justify-center gap-x-4 gap-y-1 flex-wrap text-center px-3 py-2 text-[11px] sm:text-[13px] tracking-[0.1em] sm:tracking-[0.15em] uppercase"
        style={{ ...oswald, background: `linear-gradient(90deg, ${RED}, #7f1d1d 50%, ${PINE})` }}
      >
        <span>
          Holiday gift deal: Sultan stands {formatDollars(STAND_PROMO_PRICE)} with code <b>{PROMO_CODE}</b>
        </span>
        <Link to="/order" className="bg-orange-500 text-black font-bold px-3 py-0.5 no-underline">
          Shop now
        </Link>
      </div>
    </div>
  );
}

/** Corner ribbon for the stand cards. Parent must be relative + overflow-hidden. */
export function HolidayRibbon() {
  if (!isHolidayActive()) return null;
  return (
    <span
      className="absolute top-3.5 -right-9 rotate-[40deg] text-white text-[11px] tracking-[0.2em] uppercase px-10 py-[3px] shadow"
      style={{ ...oswald, background: RED }}
    >
      {formatDollars(STAND_PROMO_PRICE)} deal
    </span>
  );
}
