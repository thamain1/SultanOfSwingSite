# WO 0001: Holiday checkout: $350 stands with PLATOS#1, Affirm + Klarna, Christmas shop

**Status:** IN REVIEW (Gate approved by Jesse 2026-11-25; mockup approved by Jesse 2026-11-25)
**Repo / branch:** C:\Dev\sultanofswing-site-wo0001 (wo-0001-holiday-checkout, from main d603db5)
**Risk:** high (customer harm if it breaks: a customer is charged the wrong amount, or a shopper can pay less than the price by editing the request; live Stripe money)
**Executor:** update Status on start/finish; fill in the Close-out block.

## Goal
Rick (Platos Pro) wants online sales back for the holiday push (Black Friday, Christmas gifts, Instagram/Facebook/TikTok ads).
Each stand (Sultan Softball SB-1000, Sultan Baseball BB-2000) costs **$350.00 with code PLATOS#1**, full price without it.
Shoppers can pay by card or finance with **Affirm or Klarna**. The Shop page and checkout get a Christmas / gift feel
that advertises the deal. Today the site is "call or email for pricing" with the checkout parked in `src/checkout/`.

## Decided (do not re-open)
- **Stand price with PLATOS#1 = flat 35000 cents each** (not a percentage). Without the code: 49500 (SB-1000), 48950 (BB-2000). (Jesse, 11/25)
- **Extras keep today's PLATOS#1 discounts:** pc-plate 10% off; sb-pk, bb-pk, bb-complete, sb-complete 20% off. Extras are separate items at current list prices. (Jesse, 11/25)
- Code match stays case-insensitive (`toUpperCase()`), only `PLATOS#1` is valid.
- The $350 code price does NOT expire; only the holiday *look* expires (see below).
- **Payment options: Card, Affirm, Klarna.** Both are on in Stripe per Jesse. Mirror the existing Affirm pattern: Klarna is a third option button using `stripe.confirmKlarnaPayment(clientSecret, {payment_method: {billing_details: {name, email, address (country US)}}, return_url})`. Keep the server's `automatic_payment_methods[enabled]=true` (the path that was live before). Show Stripe's `PaymentMethodMessagingElement` for both affirm and klarna (monthly-payment messaging must come from the provider element, never hand-written APRs or "$X/mo" numbers).
- **One source of truth for prices:** move product prices, promo prices/rates and the discount function into a shared pure module at repo root `shared/pricing.ts` (no React, no DOM, no env), imported by `src/lib/pricing.ts` / `src/lib/cart.tsx` and by `functions/api/create-payment-intent.ts`. Delete the duplicate tables.
- **Close two existing money holes in create-payment-intent (found while planning; same high-risk change):**
  1. `qty` is not validated, so `[{id:"sb-1000",qty:1},{id:"pc-plate",qty:-5}]` lowers the total. Reject any item whose qty is not an integer 1..20 (400). Reject duplicate ids or merge them (pick merge).
  2. Shipping is taken from the client (`shippingTotal`, any value > 0 up to $250), so a shopper can pay $0.01 shipping. Move the shipping calculation in `functions/api/calculate-shipping.ts` into a shared server-side function (e.g. `functions/_shared/shipping.ts` or `shared/`, whichever does NOT create a new Pages route; prove it in the gate) and have create-payment-intent compute shipping itself from items + ZIP. If the client's `shippingTotal` differs from the server's number, return **409** `{error, shipping: <server cents>}`; the client updates the shown shipping/total and asks the shopper to press pay again. Never charge a total the shopper did not see.
- **Holiday look is time-boxed:** banner/strip/holiday styling render only while `new Date() < 2027-01-01T00:00:00 Pacific`. One constant (`HOLIDAY_END`) in one file.
- **No delivery promises.** Rick has no Christmas ship-by date. No copy may say or imply arrival by Christmas/a date ("arrives by", "in time for Christmas", "by Dec"). Allowed: "the perfect gift", "give the gift of a better swing", etc.
- Brand stays black + orange (#f97316 family) with Oswald/Inter. Christmas = accents (deep red / pine green, a light CSS snowfall or ribbon detail, gift copy), not a re-skin. Respect `prefers-reduced-motion` (no snow animation when set). No new fonts, no external image CDNs, no new npm dependencies.
- Call / Email for Pricing buttons are replaced by Add to Cart (Jesse, 11/25). Phone + email stay on /order as a smaller "Questions? Call (818) 371-9006 or email ..." line (using `src/lib/contact.ts`).
- Stand cards: full price struck through + "**$350 with code PLATOS#1**". Extra cards: list price (plain). Code box hint: "Have a code? Try PLATOS#1". Applied-promo label: "PLATOS#1 applied: stands $350".
- Landing page gets one slim holiday strip linking to /order (social traffic lands there). Navbar/Landing "SHOP NOW" / "ORDER NOW" buttons unchanged.
- **Each stand ships as its own FedEx box** (Jesse, 2026-11-25, added after build): the FedEx rate request sends one 52x14x14 / 32.5 lb package per stand unit (total stand qty across SB-1000 + BB-2000, e.g. `groupPackageCount` = stand qty or one requestedPackageLineItem per box). The zone fallback multiplies by stand qty. The sanity cap scales: max = $250 per stand box + USPS. USPS extras stay one medium flat-rate box (unchanged). Same shared function serves calculate-shipping and create-payment-intent. check-pricing.ts adds cases: 2 stands = 2x one-stand FedEx rate (stubbed FedEx must see 2 packages), 2 stands fallback = 2x zone, 1 stand + 1 plate = 1 FedEx box + USPS.
- Rush/expedited shipping: OUT of scope (follow-up WO once Rick decides).

## Scope (facts from the planning search, main d603db5)
- `src/checkout/Checkout.tsx:1-10` re-enable steps: wrap routes in `<CartProvider>` (`src/App.tsx:1-20`, not used today); render `<CheckoutSection />` below the shop in `src/pages/OrderPage.tsx`; replace card buttons with add-to-cart (`useCart().addItem(id)`, `formatPrice`); restore `clearCart()` on success in `src/pages/OrderConfirmation.tsx`. Update the header comment to say checkout is live.
- Payment method UI: `Checkout.tsx:175` (`"card" | "affirm"` state -> add `"klarna"`), `:186-191` eligibility (Affirm min 3500 cents; Klarna: card fallback if Stripe says ineligible), `:228-235` elements.submit for card only, `:238-256` create-intent body, `:266` return_url, `:280-293` confirm branch, `:51-67` AffirmMessaging (generalise to affirm+klarna), `:352-420` method buttons, `:534-552` Elements setup (`paymentMethodTypes`).
- Server: `functions/api/create-payment-intent.ts` (prices :11-19, promo :21-26, discount :87-97, shipping :99-107, paymentMethod type :67 add "klarna", dead `paymentMethodTypes` array :116-119 remove). `functions/api/calculate-shipping.ts` (env FEDEX_CLIENT_ID / FEDEX_CLIENT_SECRET / FEDEX_ACCOUNT_NUMBER / FEDEX_SANDBOX; FedEx Ground Home for fedex items, USPS medium flat 1610 for others; zone fallback :107-120) keeps its route and response shape, delegating to the shared function.
- Cart math: `src/lib/cart.tsx:75-100`; prices `src/lib/pricing.ts:8-25`; products `src/lib/products.ts:12-83` (large item = `shippingType: "fedex"`).
- Order page copy: `src/pages/OrderPage.tsx:11-49` ProductCard, `:31-44` call/email buttons, `:73-89` call/email banner, `:95-98` product grid.
- Landing strip: `src/pages/LandingPage.tsx` (near the hero; SHOP NOW :77-81).
- New: `shared/pricing.ts`, shared shipping module, `scripts/check-pricing.ts` (gate script), `REVIEW.md` (added by the planner with this WO).
- **Not in scope / do not touch:** `functions/api/webhook.ts`, Navbar, Videos/Privacy pages, `.env`, `creds.txt`, untracked files in the main checkout (`AGENTS.md`, `campaign/`, `public/assets/*` untracked), product photos, the 320px footer overflow, the 2 pre-existing lint errors, repo `CLAUDE.md` (stale; leave it).

## Guardrails (this repo)
- Commit with explicit paths; **do NOT push** (not even the branch) unless Jesse says so in this session. Never `git add -A`.
- CF Pages is git-connected: **a push to `main` IS a production deploy**. No `wrangler pages deploy`, no deploy scripts.
- `.env` holds a **pk_live** key: local `npm run dev`/`preview` loads LIVE Stripe. Rendering Elements is fine; never create or confirm a PaymentIntent locally, never enter card details.
- No new npm dependencies (14-day rule; also a high-risk dependency change). Gate scripts use Node 22's built-in `--experimental-strip-types` (node v22.14.0 on this box).
- Never print secrets. Do not open `creds.txt` or `.env` beyond confirming key names.
- Repo `CLAUDE.md` is stale (says no backend). Trust this WO and the code.
- Workspace rules: `C:\Dev\REVIEW.md`; repo rules: `REVIEW.md`.

## Gate (definition of done)
1. `npm ci && npm run build` -> exit 0, no new TS errors. `npm run lint` -> no errors beyond the 2 pre-existing ones (list them).
2. `node --experimental-strip-types scripts/check-pricing.ts` -> all cases pass, prints case count (must be >= 14). It calls the real `onRequestPost` of create-payment-intent with a stubbed global `fetch` (captures the Stripe request body; returns a fake client_secret; FedEx calls stubbed to a fixed rate AND to failure for the fallback case) and the shared pricing function the cart uses. Cases, with expected amount in cents:
   - SB-1000 x1, no code, ship S -> 49500 + S; with `PLATOS#1` -> 35000 + S; with `platos#1` -> 35000 + S
   - BB-2000 x1, PLATOS#1 -> 35000 + S; SB-1000 x2 + BB-2000 x1 with code -> 105000 + S
   - stand + pc-plate + sb-pk with code -> 35000 + 4050 + 3880 + S
   - extras only with code (bb-complete x1) -> 4000 + S
   - wrong code `PLATOS#2` -> full price
   - client cart total == server total for every case above (same shared function)
   - **negative:** qty -5 / 0 / 1.5 / 21 / "2" -> 400, no Stripe call made
   - **negative:** unknown id -> 400, no Stripe call
   - **negative:** extra client fields (`price: 1`, `amount: 1`) ignored -> full server price
   - **negative:** `shippingTotal: 1` (client) vs server shipping S -> 409 with `shipping: S`, no Stripe call
   - FedEx failure -> zone fallback used consistently by both calculate-shipping and create-payment-intent
3. Route check: the shared modules create no new route. Show `ls functions/` tree and, after `npm run build`, that nothing under `functions/` other than `api/*.ts` handlers exports `onRequest*`.
4. Copy check (negative): `grep -riE "arrive|in time for|by christmas|by dec|delivered by" src shared dist/assets` -> 0 matches of delivery promises (report the count and the lines). `grep -c "PLATOS#1" dist/assets/index-*.js` >= 1. Old "for Pricing" button text gone from the bundle (0), contact line present.
5. Holiday switch: unit case in check-pricing (or a second script) showing the holiday flag is true for 2026-12-24 and false for 2027-01-01T08:00Z.
6. **UI preservation:** BEFORE (main) and AFTER (branch) screenshots via `npm run build && npm run preview` (Playwright MCP), 390px and 1280px: `/`, `/order` (empty cart), `/order` with SB-1000 + plate in cart and PLATOS#1 applied, checkout payment step with each of Card / Affirm / Klarna selected (Elements render only; do not enter details), `/order/confirmation?redirect_status=succeeded`. Element inventory table: every visible element on `/` and `/order` before -> where it is after. Only the call/email buttons may change (Jesse's decision), and they survive as the contact line. Also one AFTER screenshot with `prefers-reduced-motion: reduce` (no snow animation).
7. **Mockup stop (house rule 8):** before wiring the holiday visuals into the app, build a static mockup (`mockups/holiday-shop.html`, desktop + 390px: banner, stand card with struck price, cart with code applied, payment options with Affirm/Klarna) and **stop (Status BLOCKED: awaiting Jesse's look)**. Pricing/server/checkout re-enable work may be done before the stop. App must match the approved mockup.
   **Mockup approved by Jesse 2026-11-25 ("Mock-up looks good. Roll with it."), relayed by the planning session. The stop is lifted; mockup is `mockups/holiday-shop.html`; the app must match it.**
8. Review: fresh-context reviewer at high effort (Claude `code-reviewer`; Codex as second reviewer preferred), up to 3 rounds; no open blocking/should-fix.
9. **After Jesse's push go only (planner runs, not the executor):** push the branch for a CF preview; on the preview create one intent per method (card / affirm / klarna) with the stand + code and confirm in the response that amount = 35000 + shipping and that Affirm and Klarna options render. Then merge to main on Jesse's go, and verify live on content: `?cb=<sha>` root HTML -> bundle name -> grep bundle for "PLATOS#1" and for 0 "for Pricing".
Exit: items 1-8 pass, Status IN REVIEW -> DONE. Stop: same failure after 2 fix attempts, anything outside scope, any need to push/deploy, or the mockup stop.

## Open (not blocking the build)
- Rick: Christmas ship-by date (then a WO may add "order by" copy), rush shipping option.
- Jesse: confirm in Stripe Dashboard that `STRIPE_WEBHOOK_SECRET` is set in CF Pages env (the webhook skips signature checks when it is unset) and that the order-email recipient in `webhook.ts` is still right.

## Review log (reviewer and executor fill in; this is the loop's state)
| Round | Reviewer (tool/model) | Scope reviewed | New findings (class: count) | Fixed in |
|---|---|---|---|---|

## Close-out (executor fills in)
- **Summary:** Online ordering is back on, priced from one shared module. Commits on `wo-0001-holiday-checkout`: `62457aa` (shared/pricing.ts, server shipping + qty/shipping holes closed, checkout re-enabled with Klarna, check script, mockup) and the holiday-visuals commit that follows it (banner, landing strip, stand ribbons, snowfall, matching the approved mockup). Not pushed. No PaymentIntent created or confirmed (the check script uses a stubbed fetch and a fake key).
- **Gate results:**
  1. `npm ci` ok (250 packages). `npm run build` exit 0 (63 -> 65 modules, bundle index-*.js ~300 kB). `npm run lint`: exit 1 with exactly the 2 pre-existing errors, 0 new: `functions/api/webhook.ts:105 'shipEmail' unused` and `src/lib/cart.tsx:126 react-refresh/only-export-components` (the `useCart` export, unchanged). Also `npx tsc -p functions/tsconfig.json` exit 0 (added `allowImportingTsExtensions` there).
  2. `node --experimental-strip-types scripts/check-pricing.ts`: **71 checks passed, 0 failed** (gate asked >= 14). Covers every case listed in the gate (amounts, lowercase code, wrong code, x2+x1 = 105000+S, stand+plate+pack = 35000+4050+3880+S, extras-only 4000+S, client total == server total for 12 carts, qty -5/0/1.5/21/"2"/null -> 400 and 0 Stripe calls, unknown id and `__proto__` -> 400, extra client price fields ignored, shippingTotal 1/0/missing/string/too high -> 409 with server shipping and 0 Stripe calls, FedEx down -> zone fallback identical in calculate-shipping and create-payment-intent for CA 8000 / TX 12500 / NY 15000). Reproduced the two holes on old main first (old handler, stubbed fetch): qty -5 plate charged 42000 for a 49500 stand; shippingTotal 1 charged 49501. Both now return 400 / 409 with no Stripe call.
  3. Routes: `find functions shared scripts` -> functions/_shared/shipping.ts, functions/api/{calculate-shipping,create-payment-intent,webhook}.ts, shared/{pricing,holiday}.ts. After the final build `grep "^export .*onRequest" functions` finds 3 hits, all in functions/api/*.ts; 0 outside functions/api.
  4. Copy: `grep -riE "arrive|in time for|by christmas|by dec|delivered by" src shared dist/assets` -> 0 matches. `grep -c "PLATOS#1" dist/assets/index-*.js` = 1 (the count is lines; one minified line). "for Pricing" in bundle = 0 (also 0 for "call for pricing|email for pricing"); "Questions? Call" = 1; no em dash in new copy.
  5. Holiday switch: 5 checks in check-pricing: ON 2026-12-24, ON 2027-01-01T07:59:59Z, OFF 2027-01-01T08:00:00Z, OFF 09:00Z, HOLIDAY_END = 2027-01-01T08:00:00.000Z (midnight Pacific).
  6. UI preservation (Playwright, vite preview of main d603db5 vs the branch build, pk from the main checkout's env dir via Vite envDir, never printed or copied; no details entered). Screenshots in `C:\Dev\.playwright-mcp\wo0001\` (26 files): before-/after- home, order, confirm at 390 and 1280 (full page); after-order-cart (stand + plate + PLATOS#1: subtotal $540.00, discount -$149.50, total $390.50 before shipping) at 390 and 1280; after-payment-card/affirm/klarna at 390 and 1280 (Elements iframes rendered, 0 console errors); after-order-reduced-motion-1280. Reduced motion: `.holiday-snow` computed display = none (22 flakes, animation holiday-fall, display block when motion allowed). Landing strip sits in flow under the fixed navbar: strip bottom 121px vs hero logo top 229px at 390 (no overlap; first version overlapped the logo and was fixed). Element inventory (visible a/button/h1-h4/p/img/input/select/label/li, deduped; sample sizes before/after): `/` 390: 67/68, 1280: 70/71, only change = added "SHOP NOW" strip link, 0 removed. `/order` 390 and 1280: 49 before, 45 kept, 4 removed = "CALL FOR PRICING" button, "EMAIL FOR PRICING" button, "CALL OR EMAIL FOR PRICING" heading, the call-or-email paragraph (Jesse's decision; phone and email survive as the "Questions? Call (818) 371-9006 or email ..." line and the unchanged top-bar phone link); added 13 (Add to Cart x7, price lines, banner, contact line). `/order/confirmation?redirect_status=succeeded`: 14/14, 0 changed. The cart/checkout states have no "before" because checkout was dormant on main (n/a).
  7. Mockup stop: `mockups/holiday-shop.html` built and shown; Jesse approved 2026-11-25 ("Mock-up looks good. Roll with it."), relayed by the planning session; app wired to match.
  8. Review: pending (this hand-off).
- **Review:** not started. Round 1 should review the whole change against base d603db5 (high effort; Codex second reviewer preferred per Risk).
- **Decisions I'm NOT confident about:**
  - The Card panel's Stripe PaymentElement shows Stripe's own Bank/Affirm/Klarna tabs (plus Link) because Elements `paymentMethodTypes` lists card, affirm, klarna as the WO says; the mockup shows a plain card form. Alternative: `["card"]` only, but I could not prove the card confirm still matches the intent without creating one, so step 9 on the preview should check both.
  - `shippingTotal` missing or not a number is a 409 (shopper must see shipping first). Alternative: treat missing as "use server number", which breaks the never-charge-an-unseen-total rule.
  - Existing behaviour kept: FedEx is quoted as ONE package regardless of how many stands are in the cart (two stands ship at one-box price). Out of scope here; Rick/Jesse should decide before volume orders.
  - Stripe's messaging element renders blank (reserved 48px height) at some totals (seen at $495, text shown at $390.50); it is Stripe-controlled, wrapped in QuietBoundary.
- **Proposed learned rules:**
  - [price-single-source] Prices, promo rules and cart math live in one pure module imported by both the cart and the payment function; a check script fails if a price literal appears outside it. (source: WO 0001, 2026-11-25)
  - [client-number-is-a-check] A money amount sent by the client (shipping, total) is only compared with the server's own number and answered with 409 plus the server value on mismatch; it is never used to set the charge. (source: WO 0001, 2026-11-25)
  - [qty-bounds] Any quantity from a request is validated as an integer in a stated range before it multiplies a price; negative and fractional values are test cases. (source: WO 0001, 2026-11-25)
- **Blockers:** none.
- **Next action:** planning session dispatches the fresh `code-reviewer` (round 1, whole change vs d603db5). After review passes and Jesse says push: item 9 (preview intents per method, merge, live hash check).
