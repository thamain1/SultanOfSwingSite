import type { CSSProperties } from "react";
import { isHolidayActive } from "../../shared/holiday.ts";

// Hero snowfall (WO 0002). Pure CSS: 50 flakes (the first 25 on phones, see index.css).
// pointer-events none, aria-hidden, clipped by the hero (overflow-hidden). Hidden for
// prefers-reduced-motion. Renders only while isHolidayActive() is true.

const FLAKES = Array.from({ length: 50 }, (_, k) => {
  const d = 11 + ((k * 7) % 12);
  return {
    "--x": `${(k * 37 + 11) % 100}%`,
    "--s": `${2 + (k % 4)}px`,
    "--o": (0.28 + (k % 5) * 0.12).toFixed(2),
    "--d": `${d}s`,
    "--dl": `-${((k * 1.7) % d).toFixed(1)}s`,
    "--dx": `${(k % 2 ? 1 : -1) * (20 + (k % 3) * 15)}px`,
    "--sw": `${6 + (k % 4) * 3}px`,
    "--sd": `${3 + (k % 4)}s`,
  } as CSSProperties;
});

export default function Snowfall() {
  if (!isHolidayActive()) return null;
  return (
    <div className="snowfall" aria-hidden="true" data-snow>
      {FLAKES.map((style, k) => (
        <i key={k} style={style} />
      ))}
    </div>
  );
}
