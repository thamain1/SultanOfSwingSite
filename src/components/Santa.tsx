import { Link } from "react-router-dom";
import { isHolidayActive } from "../../shared/holiday.ts";
import { STAND_PROMO_PRICE, formatDollars } from "../lib/pricing";

// Holiday Santa (WO 0002, matches mockups/holiday-santa.html). Small original SVG
// Santa in the hero corner who swings an orange bat; links to /order.
// Renders only while isHolidayActive() is true. All motion is CSS keyframes
// (transform/opacity) in src/index.css and is switched off for prefers-reduced-motion.

export default function Santa() {
  if (!isHolidayActive()) return null;
  const deal = formatDollars(STAND_PROMO_PRICE);
  return (
    <Link to="/order" className="santa-link" aria-label={`Shop the ${deal} deal, holiday offer`} data-santa>
      <svg className="santa-svg" viewBox="0 0 250 200" aria-hidden="true" focusable="false">
        <defs><clipPath id="santa-body-clip"><ellipse cx="78" cy="128" rx="42" ry="40"/></clipPath></defs>
        <ellipse cx="82" cy="191" rx="50" ry="6" fill="#000" opacity=".4"/>
        <g className="santa-lean santa-anim">
          {/* legs + boots */}
          <rect x="52" y="156" width="16" height="22" fill="#7f1d1d"/>
          <rect x="88" y="156" width="16" height="22" fill="#7f1d1d"/>
          <rect x="42" y="181" width="32" height="9" rx="4.5" fill="#f97316"/>
          <rect x="84" y="181" width="34" height="9" rx="4.5" fill="#f97316"/>
          <rect x="42" y="172" width="32" height="15" rx="7.5" fill="#18181b"/>
          <rect x="84" y="172" width="34" height="15" rx="7.5" fill="#18181b"/>
          {/* coat */}
          <ellipse cx="78" cy="128" rx="42" ry="40" fill="#b91c1c"/>
          <g clipPath="url(#santa-body-clip)">
            <ellipse cx="104" cy="140" rx="30" ry="46" fill="#991b1b"/>
            <ellipse cx="78" cy="128" rx="42" ry="40" fill="#b91c1c" transform="translate(-9 -2)"/>
            <rect x="73" y="86" width="10" height="84" rx="5" fill="#f5f5f4"/>
            <rect x="30" y="121" width="96" height="15" fill="#18181b"/>
            <rect x="30" y="152" width="96" height="18" fill="#f5f5f4"/>
          </g>
          <rect x="65" y="118" width="26" height="22" rx="4" fill="#f97316"/>
          <rect x="71" y="123.5" width="14" height="11" rx="2" fill="#18181b"/>
          {/* arms + bat: both hands grip the handle (stacked), both arms move with the bat */}
          <g className="santa-up2 santa-anim"><path d="M0 0 H26" stroke="#7f1d1d" strokeWidth="17" strokeLinecap="round" fill="none"/><path d="M0 0 H26" stroke="#a31f1f" strokeWidth="14" strokeLinecap="round" fill="none"/><g className="santa-fore2 santa-anim"><path d="M0 0 H26" stroke="#7f1d1d" strokeWidth="17" strokeLinecap="round" fill="none"/><path d="M0 0 H26" stroke="#a31f1f" strokeWidth="14" strokeLinecap="round" fill="none"/><rect x="11" y="-9.5" width="8" height="19" rx="4" fill="#d6d3d1"/></g></g>
          <g className="santa-up1 santa-anim"><path d="M0 0 H22" stroke="#7f1d1d" strokeWidth="17" strokeLinecap="round" fill="none"/><path d="M0 0 H22" stroke="#c62828" strokeWidth="14" strokeLinecap="round" fill="none"/><g className="santa-fore1 santa-anim"><path d="M0 0 H22" stroke="#7f1d1d" strokeWidth="17" strokeLinecap="round" fill="none"/><path d="M0 0 H22" stroke="#c62828" strokeWidth="14" strokeLinecap="round" fill="none"/><rect x="7" y="-9.5" width="8" height="19" rx="4" fill="#f5f5f4"/></g></g>
          <g className="santa-bat santa-anim">
            <g className="santa-swoosh santa-anim" opacity="0"><path d="M0.0 -94.0 A94 94 0 0 0 -29.0 -89.4 L-19.8 -60.9 A64 64 0 0 1 0.0 -64.0 Z" fill="#fff" fillOpacity="0.5"/><path d="M-29.0 -89.4 A94 94 0 0 0 -55.3 -76.0 L-37.6 -51.8 A64 64 0 0 1 -19.8 -60.9 Z" fill="#fff" fillOpacity="0.28"/><path d="M-55.3 -76.0 A94 94 0 0 0 -76.0 -55.3 L-51.8 -37.6 A64 64 0 0 1 -37.6 -51.8 Z" fill="#fff" fillOpacity="0.12"/></g>
            <rect x="-3" y="-26" width="6" height="38" rx="2.5" fill="#18181b"/>
            <circle cx="0" cy="13" r="5" fill="#ea580c"/>
            <path d="M-3 -24 L-6.5 -42 Q-8.6 -62 -8 -82 Q-7.6 -91 0 -91 Q7.6 -91 8 -82 Q8.6 -62 6.5 -42 L3 -24 Z" fill="#f97316"/>
            <path d="M-4.4 -78 Q-4.8 -60 -3.6 -44" stroke="#fdba74" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
            <path d="M-8.3 -77 L8.3 -77 M-7.9 -71 L7.9 -71" stroke="#fff7ed" strokeWidth="2.2" fill="none"/>
            <circle cx="0" cy="5" r="7.8" fill="#18181b"/>
            <circle cx="0" cy="-7" r="7.8" fill="#111113"/>
            <path d="M-5 7 q5 3 10 0 M-5 -5 q5 3 10 0" stroke="#3f3f46" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
          </g>
          {/* head */}
          <ellipse cx="78" cy="68" rx="26" ry="23" fill="#fcd5b0"/>
          <path d="M49 71 C44 104 60 120 78 120 C96 120 112 104 107 71 C101 86 90 88 78 88 C66 88 55 86 49 71 Z" fill="#f5f5f4"/>
          <path d="M49 71 C44 104 60 120 78 120" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".0"/>
          <path d="M70 90 Q78 99.5 86 90 Z" fill="#7f1d1d"/>
          <ellipse cx="64" cy="83" rx="14" ry="7" fill="#fafafa" transform="rotate(-12 64 83)"/>
          <ellipse cx="92" cy="83" rx="14" ry="7" fill="#fafafa" transform="rotate(12 92 83)"/>
          <circle cx="78" cy="79" r="6.2" fill="#f4978e"/>
          <circle cx="76.2" cy="77" r="1.8" fill="#fff" opacity=".7"/>
          <circle cx="57.5" cy="77" r="5.2" fill="#fb7185" opacity=".5"/>
          <circle cx="98.5" cy="77" r="5.2" fill="#fb7185" opacity=".5"/>
          <ellipse cx="68" cy="69" rx="3" ry="3.6" fill="#18181b"/>
          <ellipse cx="89" cy="69" rx="3" ry="3.6" fill="#18181b"/>
          <circle cx="69" cy="67.8" r="1.1" fill="#fff"/>
          <circle cx="90" cy="67.8" r="1.1" fill="#fff"/>
          <path d="M60.5 62.5 Q67 58.5 74 61.5 M82 61.5 Q89 58.5 96 62.5" stroke="#fafafa" strokeWidth="4.2" strokeLinecap="round" fill="none"/>
          {/* hat */}
          <path d="M52 48 C46 24 62 7 82 7 C98 7 108 20 106 48 Z" fill="#b91c1c"/>
          <path d="M52 48 C49 36 52 24 62 15 C55 28 58 38 62 48 Z" fill="#991b1b" opacity=".0"/>
          <g className="santa-pom santa-anim">
            <path d="M62 17 C46 8 28 17 28 38" stroke="#b91c1c" strokeWidth="13" strokeLinecap="round" fill="none"/>
            <circle cx="28" cy="42" r="9" fill="#fafafa"/>
          </g>
          <rect x="46" y="41" width="64" height="20" rx="10" fill="#f5f5f4"/>
          <rect x="46" y="56" width="64" height="5" rx="2.5" fill="#f97316"/>
        </g>
        {/* ball + impact (outside the lean group so they stay put) */}
        <g className="santa-ball santa-anim">
          <circle cx="211" cy="116" r="8" fill="#fafafa"/>
          <path d="M207.4 110 Q212 116 207.4 122 M214.6 110 Q210 116 214.6 122" stroke="#b91c1c" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
        </g>
        <g className="santa-burst santa-anim">
          <polygon points="214.0,95.0 217.1,106.6 227.4,100.6 221.4,110.9 233.0,114.0 221.4,117.1 227.4,127.4 217.1,121.4 214.0,133.0 210.9,121.4 200.6,127.4 206.6,117.1 195.0,114.0 206.6,110.9 200.6,100.6 210.9,106.6" fill="#fde047"/>
          <polygon points="214.0,103.0 215.9,109.4 221.8,106.2 218.6,112.1 225.0,114.0 218.6,115.9 221.8,121.8 215.9,118.6 214.0,125.0 212.1,118.6 206.2,121.8 209.4,115.9 203.0,114.0 209.4,112.1 206.2,106.2 212.1,109.4" fill="#fff"/>
        </g>
      </svg>
      <span className="santa-tag" aria-hidden="true">
        Shop the {deal} deal
      </span>
    </Link>
  );
}
