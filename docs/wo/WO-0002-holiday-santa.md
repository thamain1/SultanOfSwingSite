# WO 0002: Front-page holiday Santa + hero snowfall

**Status:** BLOCKED (awaiting Jesse's look at the mockup, gate item 1)
**Repo / branch:** C:\Dev\sultanofswing-site-wo0002 (wo-0002-holiday-santa, from main 7b8e163 + WO-0001 doc commits)
**Risk:** low (customer harm if it breaks: the home page looks wrong or a decoration covers a button; no money, no data)
**Executor:** update Status on start/finish; fill in the Close-out block.

## Goal
For the holiday social push (Instagram/Facebook/TikTok traffic lands on `/`), add festive motion to the home page hero:
light snowfall over the hero and a small original animated Santa who swings an orange bat in the hero's corner and
links to the Shop. Holiday-only, switches off with the rest of the holiday look on 2027-01-01 Pacific.

## Decided (do not re-open)
- **Placement = supporting role (Jesse, 11/25, option B):** Santa sits small in the **bottom-right of the hero** (`src/pages/LandingPage.tsx:38` section). About 110px tall at 390px wide, about 180px at >= 1024px. The existing hero photo, headline (h1s at :65-73), SHOP NOW (:85), WATCH DEMO (:97) and trust badges stay the star and keep their positions.
- **Style = flat and bold in brand colors (Jesse, 11/25, option A):** original hand-built inline SVG: red suit (#b91c1c family), black belt/boots, orange trim + orange bat (#f97316), white beard/cuff, simple geometric shapes, no outlines-heavy detail. Readable at 110px. **Original art only**: no copying of any existing mascot, brand character or clip-art; no external images, no AI-generated raster, no new npm dependencies (no Lottie, no animation libs).
- **Animation (CSS keyframes, transform/opacity only):** wind-up -> swing -> small ball flies off to the right and fades; one cycle about 1.6 s, then a pause, repeating about every 4 s. Bat pivots at the hands (SVG `transform-box: fill-box` / explicit `transform-origin`). No layout shift.
- **Snowfall:** over the hero section only, `pointer-events: none`, behind the hero text/buttons (z-order below content, above the photo). Pure CSS or a tiny canvas, max ~50 flakes desktop / ~25 phone, low opacity, slow fall. Pause when `document.hidden` (if canvas/JS). No continuous main-thread work when idle beyond the animation itself.
- **Santa links to `/order`** (react-router `Link`), `aria-label="Shop the $350 holiday deal"`; a small "Shop the $350 deal" tag shows on hover/focus (and is visible on touch via focus). Decorative SVG parts `aria-hidden`.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, no falling snow (static faint flakes or none) and Santa shows a single static mid-swing pose, no ball animation.
- **Time-boxed:** render only when `isHolidayActive()` (`shared/holiday.ts:6`, `HOLIDAY_END` 2027-01-01T08:00Z). Reuse it; no new date constant.
- **No overlap rule:** at 390, 768, 1024, 1280 and 1440 widths, Santa's bounding box must not intersect the h1s, SHOP NOW, WATCH DEMO, or the trust badges. If the bottom-right corner is too tight on phones, Santa moves onto the existing `HolidayStrip` (`src/components/Holiday.tsx:70`, rendered at `LandingPage.tsx:36`) at phone widths instead of the hero.
- New code: `src/components/Santa.tsx` and `src/components/Snowfall.tsx` (or inside `Holiday.tsx` if small), keyframes in `src/index.css` (outside Tailwind layers so they are not purged, same as the existing `.holiday-snow`).

## Scope
- `src/pages/LandingPage.tsx` hero section (:38-110) only: mount Snowfall + Santa.
- New components as above; `src/index.css` keyframes.
- Mockup: `mockups/holiday-santa.html` (static, self-contained, desktop 1280 + phone 390 frames, Santa animating, snow, reduced-motion variant toggle).
- **Not in scope / do not touch:** /order, checkout, pricing, functions/, shared/pricing.ts, Navbar, other landing sections, the existing Shop-page snow, copy text, fonts, product photos, `.env`, `creds.txt`.

## Guardrails (this repo)
- Commit with explicit paths; **do NOT push** unless Jesse says so. A push to `main` is a production deploy (git-connected CF Pages). No `wrangler`.
- `.env` holds pk_live; local preview may load Stripe on /order only; never create intents.
- No new npm dependencies.
- Repo rules: `REVIEW.md`; workspace: `C:\Dev\REVIEW.md`.
- Preserve existing UI (house rule): every element on `/` survives in place.

## Gate (definition of done)
1. **Mockup stop:** build `mockups/holiday-santa.html` first and STOP (Status BLOCKED: awaiting Jesse's look). Return its path plus PNG screenshots at 1280 and 390 (two frames each: wind-up and follow-through) saved under `C:\Dev\.playwright-mcp\wo0002\`. After approval, the app must match the mockup.
2. `npm ci && npm run build` -> exit 0; `npm run lint` -> only the 2 pre-existing errors; `node --experimental-strip-types scripts/check-pricing.ts` -> still 143/143 (unchanged).
3. UI preservation: BEFORE (main) and AFTER screenshots of `/` at 390 and 1280 (hero + full page), element inventory of `/` (every element before -> where after; only additions allowed).
4. Overlap check (Playwright, measured): at widths 390, 768, 1024, 1280, 1440, report Santa's bounding box and assert 0 intersections with the h1s, SHOP NOW, WATCH DEMO, trust badges. Print the table.
5. Reduced motion: screenshot with `prefers-reduced-motion: reduce` + computed `animation-name` on Santa parts and snow = none.
6. Holiday off: with the clock past HOLIDAY_END (Playwright `page.clock` or a forced flag in a test-only path), Santa and snow are absent from the DOM (count 0).
7. Santa link: clicking it navigates to `/order`; it has the aria-label; keyboard focus shows the tag.
8. Perf sanity: JS bundle growth reported (expected < 10 KB gzip); no new network requests on `/` (compare request lists before/after).
9. Review: one fresh-context round (low risk), no open blocking/should-fix.
Exit: all pass -> DONE. Stop: same failure after 2 fix attempts, anything out of scope, or the mockup stop.

## Review log
| Round | Reviewer (tool/model) | Scope reviewed | New findings (class: count) | Fixed in |
|---|---|---|---|---|

## Close-out (executor fills in)
- **Summary:**
- **Gate results:**
- **Review:**
- **Decisions I'm NOT confident about:**
- **Proposed learned rules:**
- **Blockers:** Mockup stop (gate 1). `mockups/holiday-santa.html` built; screenshots in `C:\Dev\.playwright-mcp\wo0002\` (mockup-1280-*, mockup-390-*, mockup-poses.png). BEFORE screenshots of `/` (gate 3) taken: before-390-*/before-1280-* + inventory-BEFORE.json (189 elements each width). App code not touched yet. Open design question for Jesse: phone Santa placement/size (see close-out note).
- **Next action:**
