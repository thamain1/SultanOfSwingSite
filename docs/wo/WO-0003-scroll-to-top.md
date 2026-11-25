# WO 0003: Scroll to top on page change

**Status:** IN REVIEW
**Repo / branch:** C:\Dev\sultanofswing-site-wo0002 (wo-0003-scroll-top, from main e121469)
**Risk:** low (customer harm if it breaks: a page opens scrolled to the wrong place)
**Executor:** planner (one-file fix; fresh reviewer checks it)

## Goal
Jesse 2026-11-25: clicking SHOP NOW / ORDER NOW lower on the home page opens /order part-way down instead of at the top.

## Decided
- Add `src/components/ScrollToTop.tsx` mounted inside `<BrowserRouter>` in `src/App.tsx`: on a new route (PUSH/REPLACE) `window.scrollTo(0,0)` in a layout effect. Skip POP (browser Back/Forward) and URLs with a #hash.
- Navbar section links from another page (`Navbar.tsx:17-27`: navigate('/') then scrollIntoView after a delay) must still land on the section.

## Gate
1. Reproduce on live main (e121469), 390x844: scrolled to 5452, clicked the last ORDER NOW -> /order opened at scrollY 3321.6 (FAIL captured).
2. Same steps on the branch build -> scrollY 0 on /order (PASS), also from /videos SHOP NOW.
3. From /order, Navbar "How it works" -> lands on #how-it-works section (scrollY > 0, section top within 100px of viewport top).
4. Browser Back from /order to / does not force scrollY 0 (POP untouched).
5. `npm run build` exit 0; lint only the 2 pre-existing errors.
6. One fresh review round.

## Review log
| Round | Reviewer | Scope | Findings | Fixed in |
|---|---|---|---|---|

## Close-out
- **Summary:** `src/components/ScrollToTop.tsx` (new) mounted in `src/App.tsx`; instant scroll to top on PUSH/REPLACE route changes, POP and #hash untouched.
- **Gate results:**
  1. Reproduced on live e121469 (390x844): home scrolled to 5452 -> ORDER NOW -> /order at scrollY 3321.6 (FAIL).
  2. Branch build (vite preview :4174, 390x844): home 5252 -> ORDER NOW -> /order scrollY 0; /videos bottom -> SHOP NOW -> /order scrollY 0 (PASS).
  3. First attempt (`window.scrollTo(0,0)`) broke Navbar section links from another page (navSectionY 0, section 2181px below). Fixed with `behavior: 'instant'`; re-run: /videos -> Navbar "How it works" -> scrollY 2180.8, section top 0 (PASS, same as live 2180.8/0).
  4. Back from /order -> home scrollY 5263 (POP untouched, PASS).
  5. `npm run build` exit 0; lint = the 2 pre-existing errors only.
- **Decisions I'm NOT confident about:** none.
