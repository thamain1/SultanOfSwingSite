# REVIEW.md: Sultan of Swing site

Review rules for this repo. Every reviewer (Claude `code-reviewer`, Codex, Kimi) reads this after the
workspace rules (`C:\Dev\REVIEW.md`). Process lives in the `work-order` skill.

## What this app is and who gets hurt
Public storefront for Platos Pro LLC's Sultan of Swing batting stands (React + Vite on Cloudflare Pages,
Pages Functions in `functions/api/` for Stripe PaymentIntents, FedEx/USPS shipping quotes and the Stripe webhook).
Real customers pay real money through LIVE Stripe (card, Affirm, Klarna). A break means a customer is charged
the wrong amount, can pay less than the price, never gets an order email to the seller, or cannot buy at all.

## Severity (this repo)
- **blocking:** any way the charged amount differs from server prices (client-trusted price, qty, discount or shipping); charging a total the shopper did not see; secrets in the bundle or logs; webhook accepting unsigned events in a new path.
- **should-fix:** client and server price math drifting apart; checkout states that strand the shopper (no error shown, double submit); delivery-date promises in copy; missing reduced-motion handling on animation.
- **nit:** copy, spacing, naming.

## Never touch / hard guardrails
- A push to `main` is a production deploy (git-connected CF Pages). No `wrangler pages deploy`.
- `.env` holds a **pk_live** key: local dev talks to LIVE Stripe. Never create or confirm intents locally.
- Never commit `.env`, `creds.txt`, pricing exhibits (`*.docx`).
- Repo `CLAUDE.md` is stale (says no backend). Trust the code.

## How to test it
- Build: `npm run build`  Lint: `npm run lint` (2 errors pre-existed before WO 0001)
- Tests: `node --experimental-strip-types scripts/check-pricing.ts` (added by WO 0001)
- Live check: fetch `/?cb=<sha>` with a browser User-Agent, read the `assets/index-*.js` name, grep that bundle for the new string and for the removed one. A 200 proves nothing.

## Ignore (not findings here)
- `src/checkout/` living outside `src/pages/` is intentional.

## Learned rules
<!-- Added only after Jesse approves. Format: - [class-slug] rule (source: WO NNNN, date) -->
