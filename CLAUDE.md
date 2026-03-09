# Sultan of Swing — CLAUDE.md

## Repository & Local Path

| Field | Value |
|-------|-------|
| Local path | `C:\Dev\sultanofswing-site` |
| GitHub | https://github.com/thamain1/SultanOfSwingSite |
| Branch | (not yet established — no `.git` initialized at time of writing) |

## Overview

Two-page sales site for the **Sultan of Swing** batting training device. The product is a bungee-cord-based hitting trainer that lets batters take continuous swings without re-placing a ball on a tee. Priced at **$349** with free shipping and a 30-day guarantee.

The site is a single-page marketing funnel (landing page) with a separate checkout/order page.

## Tech Stack

- **React 19** + **TypeScript 5.9**
- **Vite 7** (dev server & build)
- **Tailwind CSS 3** (v3 config file, PostCSS + Autoprefixer)
- **react-router-dom 7** (BrowserRouter, two routes)
- **No backend / no database** — static site, no API calls
- **No animation library** — all transitions via Tailwind utility classes
- **Fonts**: Oswald (display/headings) + Inter (body) loaded from Google Fonts CDN

## Project Structure

```
sultanofswing-site/
  index.html                  # Vite entry point
  package.json
  vite.config.ts              # Minimal — just react plugin
  tailwind.config.js          # Custom orange palette + Oswald/Inter fonts
  postcss.config.js           # tailwindcss + autoprefixer
  tsconfig.json               # References app + node configs
  tsconfig.app.json           # Strict mode, ES2022, react-jsx
  tsconfig.node.json
  eslint.config.js            # Flat config — TS + react-hooks + react-refresh
  public/
    favicon.svg               # Orange rounded-rect with white "S"
    vite.svg
    assets/                   # Product photos + videos (flat)
      30_second_ad_compressed.mp4   # Demo video played in modal
      demo.mp4
      sultanswinggroup.mp4
      black_and_orange.jpg
      kid_hitting_ball.jpg
      new_swing.jpg
      old_way_training.jfif
      orange_batter.jpg
      swinging.jpg
      set_it.jpg
      second_swing.jpg
      stand_image.jpg
      freestanding.jpg
      Screenshot_20260226_212809_Gallery.jpg
    assets/sultanofswing/     # Duplicate/alternate asset folder (legacy)
      glitch.jpg
      preview_home.png
      VID_20251102_163946.mp4
      (+ copies of some root assets)
  src/
    main.tsx                  # ReactDOM entry, StrictMode
    App.tsx                   # BrowserRouter with two routes
    index.css                 # Google Fonts import, Tailwind directives, base reset
    components/
      Navbar.tsx              # Fixed top nav — logo, scroll-to links, SHOP NOW button
    pages/
      LandingPage.tsx         # Full marketing landing page (all sections)
      OrderPage.tsx           # Checkout form with order summary sidebar
  dist/                       # Built output (committed or generated)
```

## Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `/` | `LandingPage` | Marketing landing page with all sales sections |
| `/order` | `OrderPage` | Checkout / order form |

## Site Sections (LandingPage)

The landing page is a single scrollable page with the following sections, top to bottom:

1. **Navbar** — Fixed top bar. Logo ("SULTAN / OF SWING"), nav links (How It Works, Results, Reviews) with smooth-scroll, SHOP NOW CTA button.
2. **Hero** — Full-screen background image (`swinging.jpg`), gradient overlay. Headline: "TRAIN A BETTER SWING ANYWHERE". Subline: "Timing - Barrel Control - Repetition". Two CTAs: SHOP NOW ($349) and WATCH DEMO (opens video modal). Trust badges: Ships Fast, Durable, Portable.
3. **What It Improves** — 3-column grid: Timing, Barrel Path, Confidence. Orange-bordered cards.
4. **Old Way vs. The Sultan Way** (`id="results"`) — Side-by-side comparison. Left: static tee (grayscale image, red X markers). Right: Sultan device (clickable, opens demo video, green checkmarks).
5. **How It Works** (`id="how-it-works"`) — 3-step grid with images: Set It, Swing, Repeat. Numbered 01/02/03.
6. **Reviews** (`id="reviews"`) — 3-column testimonial grid. All names are `[Placeholder]` (not yet populated with real reviews).
7. **Final CTA** — Background image overlay. "READY TO ELEVATE YOUR GAME?" with ORDER NOW button + trust badges (Ships Fast, Durable Build, Portable, 30-Day Guarantee).
8. **Footer** — Brand name, copyright 2026, Privacy/Terms/Contact links (all `#` placeholders).
9. **Video Modal** — Overlay triggered by WATCH DEMO or clicking the Sultan Way image. Plays `30_second_ad_compressed.mp4`. Closes on backdrop click, Escape key, or close button.

## Order Page (OrderPage)

- Top bar with back link to landing page + "SECURE CHECKOUT" label
- 3-section form: Contact Information, Shipping Address, Payment
- **Payment is not functional** — shows "PAYMENT PROCESSOR INTEGRATION PENDING" banner. Card fields are disabled (opacity-60, pointer-events-none). Submit shows a JS alert.
- Right sidebar: order summary with product image, quantity selector (+/-), subtotal, free shipping, total
- Trust badges in sidebar

## Brand Colors & Design

| Element | Value |
|---------|-------|
| Primary accent | Orange `#f97316` (Tailwind `orange-500`) |
| Orange light | `#fb923c` (`orange-400`) |
| Orange dark | `#ea580c` (`orange-600`) |
| Background | Black (`bg-black`, `bg-zinc-950`) |
| Text primary | White |
| Text secondary | `gray-300`, `gray-400`, `gray-500` |
| Borders | `white/10` (subtle dividers) |
| Display font | **Oswald** (all headings, buttons, labels — applied via inline `style` objects) |
| Body font | **Inter** (paragraphs, descriptions) |
| Design style | Dark, bold, athletic/sports — all-caps headings, wide letter-spacing, orange accent on black |

## Favicon

Orange rounded rectangle with a bold white "S" letter (`public/favicon.svg`).

## Development Commands

```bash
cd C:\Dev\sultanofswing-site

npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # TypeScript check + Vite production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint (flat config, TS + React)
```

## Deployment

No deployment configuration exists yet. No `wrangler.toml`, `netlify.toml`, `vercel.json`, or Cloudflare Pages Functions folder. The site is purely static (no backend) and can be deployed to any static host.

The `dist/` folder is present with a built version of the site.

## Backend / API Integrations

**None.** The site is fully static with no API calls, no database, and no server-side logic.

The order form mentions future integration with **Stripe / Square / PayPal** but none are connected yet. The submit handler shows a placeholder alert.

## Current Status

- Landing page: **Complete** — all marketing sections built and styled
- Order page: **Layout complete**, payment integration **not connected**
- Reviews: **Placeholder names** — need real testimonials
- Footer links (Privacy, Terms, Contact): **All point to `#`** — not implemented
- Video assets: Present and working (demo modal plays `30_second_ad_compressed.mp4`)
- No routing for 404 / catch-all
- No SEO meta tags beyond `<title>`
- No analytics or tracking scripts
- `public/assets/sultanofswing/` subfolder contains duplicate/legacy assets that could be cleaned up
- Product price hardcoded at `$349` in multiple places (Hero CTA, Order page)
