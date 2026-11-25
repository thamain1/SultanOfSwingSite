// Gate script for WO 0001. Run: node --experimental-strip-types scripts/check-pricing.ts
// Calls the REAL onRequestPost handlers with a stubbed global fetch (no network,
// fake Stripe key) and the shared pricing function the cart uses.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { onRequestPost as createIntent } from "../functions/api/create-payment-intent.ts";
import { onRequestPost as calcShipping } from "../functions/api/calculate-shipping.ts";
import { priceCart, validateItems, type LineItem } from "../shared/pricing.ts";
import { HOLIDAY_END, isHolidayActive } from "../shared/holiday.ts";

let passed = 0;
const failures: string[] = [];
function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    passed++;
    console.log(`  ok   ${name}`);
  } else {
    failures.push(name);
    console.log(`  FAIL ${name} ${detail}`);
  }
}

// ---- stubbed fetch -------------------------------------------------------
type FedexMode = "ok" | "fail";
let fedexMode: FedexMode = "ok";
const FEDEX_CHARGE_DOLLARS = 95.5; // -> 9550 cents
const stripeCalls: string[] = [];
let fedexRateCalls = 0;

globalThis.fetch = (async (input: unknown, init?: { body?: unknown }) => {
  const url = String(input);
  if (url.startsWith("https://api.stripe.com/v1/payment_intents")) {
    stripeCalls.push(String(init?.body ?? ""));
    return Response.json({ client_secret: "pi_fake_secret_fake" });
  }
  if (url.endsWith("/oauth/token")) {
    return fedexMode === "ok" ? Response.json({ access_token: "tok" }) : new Response("no", { status: 500 });
  }
  if (url.endsWith("/rate/v1/rates/quotes")) {
    fedexRateCalls++;
    return fedexMode === "ok"
      ? Response.json({ output: { rateReplyDetails: [{ ratedShipmentDetails: [{ totalNetCharge: FEDEX_CHARGE_DOLLARS }] }] } })
      : new Response("no", { status: 500 });
  }
  throw new Error(`unstubbed fetch (would hit the network): ${url}`);
}) as typeof fetch;

const ENV = {
  STRIPE_SECRET_KEY: "sk_test_fake_not_real",
  FEDEX_CLIENT_ID: "id",
  FEDEX_CLIENT_SECRET: "secret",
  FEDEX_ACCOUNT_NUMBER: "000",
};

const FEDEX = 9550; // large item, stubbed live rate
const USPS = 1610; // any other item
const DEST = { name: "Test Buyer", address: "1 Main St", city: "Pomona", state: "CA", zip: "91766" };

interface Post {
  status: number;
  json: Record<string, unknown>;
  stripe: URLSearchParams | null;
  stripeCalls: number;
}

async function post(body: Record<string, unknown>): Promise<Post> {
  const before = stripeCalls.length;
  const request = new Request("https://example.test/api/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const res = await (createIntent as unknown as (c: unknown) => Promise<Response>)({ request, env: ENV });
  const json = (await res.json()) as Record<string, unknown>;
  const made = stripeCalls.length - before;
  return {
    status: res.status,
    json,
    stripe: made > 0 ? new URLSearchParams(stripeCalls[stripeCalls.length - 1]) : null,
    stripeCalls: made,
  };
}

function req(items: unknown, extra: Record<string, unknown> = {}): Record<string, unknown> {
  return { items, shipping: DEST, email: "buyer@example.test", ...extra };
}

async function expectAmount(label: string, items: LineItem[], promoCode: string | undefined, ship: number, expected: number) {
  const r = await post(req(items, { promoCode, shippingTotal: ship }));
  const amount = r.stripe ? Number(r.stripe.get("amount")) : NaN;
  check(`${label}: Stripe amount ${expected}`, r.status === 200 && amount === expected, `status=${r.status} amount=${amount}`);
  check(`${label}: response total == amount`, r.json.total === amount, `total=${String(r.json.total)}`);
  // client cart total (shared function the cart calls) == server total
  const client = priceCart(items, promoCode, ship).total;
  check(`${label}: client cart total ${client} == server`, client === amount, `client=${client}`);
}

async function main(): Promise<void> {
  console.log("pricing cases");
  const SB = { id: "sb-1000", qty: 1 };
  const BB = { id: "bb-2000", qty: 1 };
  await expectAmount("SB-1000 no code", [SB], undefined, FEDEX, 49500 + FEDEX);
  await expectAmount("SB-1000 PLATOS#1", [SB], "PLATOS#1", FEDEX, 35000 + FEDEX);
  await expectAmount("SB-1000 platos#1 (lowercase)", [SB], "platos#1", FEDEX, 35000 + FEDEX);
  await expectAmount("BB-2000 no code", [BB], undefined, FEDEX, 48950 + FEDEX);
  await expectAmount("BB-2000 PLATOS#1", [BB], "PLATOS#1", FEDEX, 35000 + FEDEX);
  await expectAmount("SB x2 + BB x1 PLATOS#1", [{ id: "sb-1000", qty: 2 }, BB], "PLATOS#1", FEDEX, 105000 + FEDEX);
  await expectAmount(
    "stand + pc-plate + sb-pk PLATOS#1",
    [SB, { id: "pc-plate", qty: 1 }, { id: "sb-pk", qty: 1 }],
    "PLATOS#1", FEDEX + USPS, 35000 + 4050 + 3880 + FEDEX + USPS,
  );
  await expectAmount("extras only bb-complete PLATOS#1", [{ id: "bb-complete", qty: 1 }], "PLATOS#1", USPS, 4000 + USPS);
  await expectAmount("extras only, no code", [{ id: "bb-complete", qty: 1 }], undefined, USPS, 5000 + USPS);
  await expectAmount("wrong code PLATOS#2 = full price", [SB], "PLATOS#2", FEDEX, 49500 + FEDEX);
  await expectAmount("non-string promoCode = full price", [SB], 5 as unknown as string, FEDEX, 49500 + FEDEX);
  await expectAmount("duplicate ids merge (SB + SB = x2)", [SB, SB], "PLATOS#1", FEDEX, 70000 + FEDEX);

  console.log("negative: bad quantities and ids (400, no Stripe call)");
  for (const [label, qty] of [["-5", -5], ["0", 0], ["1.5", 1.5], ["21", 21], ['"2" (string)', "2"], ["null", null]] as const) {
    const r = await post(req([{ id: "sb-1000", qty: 1 }, { id: "pc-plate", qty }], { shippingTotal: FEDEX + USPS }));
    check(`qty ${label} -> 400, no Stripe call`, r.status === 400 && r.stripeCalls === 0, `status=${r.status} calls=${r.stripeCalls}`);
  }
  {
    const r = await post(req([{ id: "sb-1000", qty: 12 }, { id: "sb-1000", qty: 12 }], { shippingTotal: FEDEX }));
    check("duplicate ids merging past 20 -> 400", r.status === 400 && r.stripeCalls === 0, `status=${r.status}`);
  }
  {
    const r = await post(req([{ id: "nope-9000", qty: 1 }], { shippingTotal: USPS }));
    check("unknown id -> 400, no Stripe call", r.status === 400 && r.stripeCalls === 0, `status=${r.status}`);
  }
  {
    const r = await post(req([{ id: "__proto__", qty: 1 }], { shippingTotal: USPS }));
    check("prototype-key id -> 400, no Stripe call", r.status === 400 && r.stripeCalls === 0, `status=${r.status}`);
  }
  for (const [label, items] of [["empty array", []], ["not an array", "sb-1000"], ["missing", undefined]] as const) {
    const r = await post(req(items, { shippingTotal: FEDEX }));
    check(`items ${label} -> 400, no Stripe call`, r.status === 400 && r.stripeCalls === 0, `status=${r.status}`);
  }

  console.log("negative: client-supplied price fields ignored");
  {
    const r = await post(req(
      [{ id: "sb-1000", qty: 1, price: 1, amount: 1, unitPrice: 1 }],
      { price: 1, amount: 1, total: 1, subtotal: 1, discount: 99999, shippingTotal: FEDEX },
    ));
    const amount = r.stripe ? Number(r.stripe.get("amount")) : NaN;
    check("extra client fields ignored -> 49500 + S", r.status === 200 && amount === 49500 + FEDEX, `amount=${amount}`);
  }

  console.log("negative: client shipping must match the server (409, no Stripe call)");
  for (const [label, shippingTotal] of [["1", 1], ["0", 0], ["missing", undefined], ["string", String(FEDEX)], ["too high", FEDEX + 1]] as const) {
    const r = await post(req([SB], { promoCode: "PLATOS#1", shippingTotal }));
    check(
      `shippingTotal ${label} -> 409 with server shipping ${FEDEX}, no Stripe call`,
      r.status === 409 && r.json.shipping === FEDEX && r.stripeCalls === 0,
      `status=${r.status} shipping=${String(r.json.shipping)} calls=${r.stripeCalls}`,
    );
  }

  console.log("shipping: FedEx failure uses the zone fallback in BOTH routes");
  fedexMode = "fail";
  for (const [state, zone] of [["CA", 8000], ["TX", 12500], ["NY", 15000]] as const) {
    const calc = await (calcShipping as unknown as (c: unknown) => Promise<Response>)({
      request: new Request("https://example.test/api/calculate-shipping", {
        method: "POST",
        body: JSON.stringify({ items: [SB], destination: { zip: "00000", state } }),
      }),
      env: ENV,
    });
    const calcJson = (await calc.json()) as { total: number };
    const r = await post(req([SB], { promoCode: "PLATOS#1", shippingTotal: zone, shipping: { ...DEST, state, zip: "00000" } }));
    const amount = r.stripe ? Number(r.stripe.get("amount")) : NaN;
    check(
      `FedEx down, ${state}: calculate-shipping ${calcJson.total} == intent shipping == ${zone}`,
      calcJson.total === zone && r.status === 200 && r.json.shipping === zone && amount === 35000 + zone,
      `calc=${calcJson.total} intent=${String(r.json.shipping)} amount=${amount}`,
    );
  }
  fedexMode = "ok";
  {
    const calc = await (calcShipping as unknown as (c: unknown) => Promise<Response>)({
      request: new Request("https://example.test/api/calculate-shipping", {
        method: "POST",
        body: JSON.stringify({ items: [SB, { id: "pc-plate", qty: 1 }], destination: { zip: "91766", state: "CA" } }),
      }),
      env: ENV,
    });
    const j = (await calc.json()) as { total: number };
    check(`FedEx up: calculate-shipping stand + plate = ${FEDEX + USPS}`, j.total === FEDEX + USPS, `got ${j.total}`);
  }
  {
    const rateCallsBefore = fedexRateCalls;
    await post(req([{ id: "bb-pk", qty: 1 }], { shippingTotal: USPS }));
    check("small-only cart makes no FedEx rate call", fedexRateCalls === rateCallsBefore);
  }

  console.log("stripe request shape");
  {
    const r = await post(req([SB], { promoCode: "PLATOS#1", shippingTotal: FEDEX, paymentMethod: "klarna" }));
    check("automatic_payment_methods[enabled]=true kept", r.stripe?.get("automatic_payment_methods[enabled]") === "true");
    check("no payment_method_types sent (dead array removed)", r.stripe !== null && ![...r.stripe.keys()].some((k) => k.startsWith("payment_method_types")));
    check("metadata promoCode recorded only when applied", r.stripe?.get("metadata[promoCode]") === "PLATOS#1");
    const bad = await post(req([SB], { promoCode: "NOPE", shippingTotal: FEDEX }));
    check("metadata promoCode empty for an unapplied code", bad.stripe?.get("metadata[promoCode]") === "");
  }

  console.log("validateItems");
  check("validateItems merges and keeps order", JSON.stringify(validateItems([{ id: "pc-plate", qty: 2 }, { id: "sb-pk", qty: 1 }, { id: "pc-plate", qty: 3 }])) ===
    JSON.stringify({ ok: true, items: [{ id: "pc-plate", qty: 5 }, { id: "sb-pk", qty: 1 }] }));

  console.log("one source of truth: no price tables outside shared/");
  const roots = ["src", "functions"];
  const hits: string[] = [];
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(name) && /\b(49500|48950|4850|4250|5350)\b/.test(readFileSync(p, "utf8"))) hits.push(p);
    }
  };
  roots.forEach(walk);
  check("no price literals in src/ or functions/", hits.length === 0, hits.join(", "));
  check("cart.tsx prices through priceCart", /priceCart\(/.test(readFileSync("src/lib/cart.tsx", "utf8")));

  console.log("holiday switch");
  check("holiday ON 2026-12-24", isHolidayActive(new Date("2026-12-24T12:00:00Z")) === true);
  check("holiday ON 2027-01-01T07:59:59Z (still Dec 31 Pacific)", isHolidayActive(new Date("2027-01-01T07:59:59Z")) === true);
  check("holiday OFF 2027-01-01T08:00:00Z", isHolidayActive(new Date("2027-01-01T08:00:00Z")) === false);
  check("holiday OFF 2027-01-01T08:00Z+1h", isHolidayActive(new Date("2027-01-01T09:00:00Z")) === false);
  check("HOLIDAY_END is 2027-01-01 08:00Z", HOLIDAY_END.toISOString() === "2027-01-01T08:00:00.000Z");

  console.log(`\n${passed} checks passed, ${failures.length} failed`);
  if (passed < 14) failures.push("fewer than 14 checks ran");
  if (failures.length > 0) {
    console.log("FAILED: " + failures.join("; "));
    process.exit(1);
  }
}

main();
