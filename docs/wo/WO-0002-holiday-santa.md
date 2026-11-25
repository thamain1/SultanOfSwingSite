# WO 0002: Front-page holiday Santa + hero snowfall

**Status:** IN REVIEW
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

- **Jesse's mockup review (2026-11-25): size/placement option A CONFIRMED** (phone 78px top-right under the strip, tablet 112px, desktop 180px bottom-right). **One change, applied to mockup and app:** Santa holds the bat with BOTH hands (stacked grip, both mittens on the handle) and both arms move together with the bat through wind-up, contact and follow-through, and in the reduced-motion pose.

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
- **Summary:** Built to match the approved mockup (option A confirmed by Jesse 11/25, plus the two-handed grip change). New `src/components/Santa.tsx` (inline SVG, `Link` to `/order`, aria-label from `formatDollars(STAND_PROMO_PRICE)`) and `src/components/Snowfall.tsx` (50 CSS flakes, 25 on phones); both return null unless `isHolidayActive()`. Keyframes and layout CSS in `src/index.css` (outside Tailwind layers). Mounted only in the hero section of `src/pages/LandingPage.tsx` (3 lines + 2 imports). Both arms are two-bone chains (upper arm + forearm) animated with generated keyframes (1% steps) so both stacked gloves stay on the handle through the whole swing (max hand-to-glove error 0.31 user units across the timeline). Mockup updated to the same art: `mockups/holiday-santa.html`.
- **Gate results:**
  - Gate 1 (mockup): done, approved by Jesse with one change (both hands), applied. Pose screenshots in `C:\Dev\.playwright-mcp\wo0002\` (mockup-poses.png, mockup-1280-*, mockup-390-*, mockup-santa-crop-*).
  - Gate 2: `npm run build` exit 0; `npm run lint` 2 errors, both the pre-existing ones (functions/api/webhook.ts:105 shipEmail, src/lib/cart.tsx:192); `check-pricing.ts` 143 passed, 0 failed.
  - Gate 3: BEFORE and AFTER screenshots at 390 and 1280 (hero + full page): `before-*` and `after-*` in the folder above. Element inventory of `/` (preview builds of main vs this branch, svg paths excluded): 189 elements before, 189 matched in place after at 390 and at 1280, 0 missing, 0 moved or resized, 0 unexpected extras. Additions only: 129 elements inside `.santa-link` and `.snowfall` (50 flakes, 1 svg, 1 anchor, 1 container).
  - Gate 4 (measured, 9 targets each: 3 h1s, SHOP NOW, WATCH DEMO, 3 badges, logo; santa box = the link element): 390x800 box 270,123,367,201 (98x78, top-right) 0 hits; 390x844 same 0; 768x800 601,883,741,995 (140x112) 0; 1024x800 768,815,993,995 (225x180) 0; 1280x800 1024,815,1249,995 (225x180) 0; 1440x900 1184,824,1409,1004 (225x180) 0. Santa inside the hero box at all 6; no horizontal scroll at any.
  - Gate 5: with reduced motion emulated, computed animation-name = none on all 10 animated Santa parts and on all 50 flakes, snow container display none, 0 running animations; screenshots after-1280-reduced-motion.png and after-390-reduced-motion.png show the static two-handed contact pose with the ball on the bat. Control (no-preference): 10 Santa animation names present, snow display block, 110 running animations at 1280 (60 at 390).
  - Gate 6: clock forced to 2027-01-02T12:00Z (Date override via init script): `.santa-link` 0, `.santa-svg` 0, `.snowfall` 0, flakes 0 (the existing HolidayStrip also gone, 3 h1s still present); screenshot after-1280-holiday-off.png.
  - Gate 7: link href /order, aria-label "Shop the $350 holiday deal", svg and tag aria-hidden; keyboard Tab reached it on the 10th press, :focus-visible true, tag opacity 1 (after-1280-focus-tag.png); Enter and a mouse click both navigated to /order.
  - Gate 8: gzip JS 95.73 -> 97.64 KB (+1.91), CSS 5.15 -> 8.09 KB (+2.94), total +4.85 KB (under the 10 KB budget). Requests on `/` at 1280: 23 before, 23 after; same-origin list identical (10), external hosts identical (fonts and Stripe, all pre-existing); 0 new requests.
- **Review:** pending (fresh code-reviewer, round 1).
- **Decisions I'm NOT confident about:** (1) Phone Santa is 78px top-right under the strip (planner option A, Jesse confirmed); it only just fits above the logo, so a taller phone screen or a wrapped strip should be eyeballed on a real device. (2) The snow uses the individual CSS `translate` property (Chrome 104+, Safari 14.1+, Firefox 72+); older browsers show flakes sitting at the top, harmless. (3) Arm keyframes are generated (about 12 KB raw CSS, about 2 KB gzip); if the art changes the keyframes must be regenerated, not hand-edited. (4) Hover tag is not reachable by tap alone on touch; a tap just goes to /order.
- **Proposed learned rules:** none from this build. (For the planner: the mockup stop caught a layout assumption early; a Playwright element screenshot does not tick CSS transitions, so assert hover/focus styles after a real frame, not on computed style alone.)
- **Blockers:** none. Build proceeded on option A pending Jesse; Jesse confirmed option A on 11/25 and asked for the two-handed grip, which is in.
- **Next action:** fresh-context code-reviewer round 1, then Jesse to approve push (do not push without his word; a push to main deploys).
