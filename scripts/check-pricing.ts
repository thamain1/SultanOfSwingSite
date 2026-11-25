// Gate script for WO 0001. Run: node --experimental-strip-types scripts/check-pricing.ts
// Calls the REAL onRequestPost handlers with a stubbed global fetch (no network,
// fake Stripe key), a stubbed Workers Cache, and the shared pricing function the
// cart uses.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { onRequestPost as createIntent } from "../functions/api/create-payment-intent.ts";
import { onRequestPost as calcShipping } from "../functions/api/calculate-shipping.ts";
import {
  US_STATE_CODES,
  isValidPromoCode,
  priceCart,
  validateDestination,
  validateItems,
  type LineItem,
} from "../shared/pricing.ts";
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
const FEDEX_DOLLARS_PER_BOX = 95.5; // -> 9550 cents per stand box
let fedexFlatDollars: number | null = null; // override: one flat charge for the whole shipment
const stripeCalls: string[] = [];
let fedexRateCalls = 0;
let fedexAuthCalls = 0;
const fedexPackagesSeen: number[] = [];
const fedexZipsSeen: string[] = [];

globalThis.fetch = (async (input: unknown, init?: { body?: unknown }) => {
  const url = String(input);
  if (url.startsWith("https://api.stripe.com/v1/payment_intents")) {
    stripeCalls.push(String(init?.body ?? ""));
    return Response.json({ client_secret: "pi_fake_secret_fake" });
  }
  if (url.endsWith("/oauth/token")) {
    fedexAuthCalls++;
    return fedexMode === "ok" ? Response.json({ access_token: "tok" }) : new Response("no", { status: 500 });
  }
  if (url.endsWith("/rate/v1/rates/quotes")) {
    fedexRateCalls++;
    if (fedexMode !== "ok") return new Response("no", { status: 500 });
    const body = JSON.parse(String(init?.body)) as {
      requestedShipment: { recipient: { address: { postalCode: string } }; requestedPackageLineItems: { groupPackageCount?: number }[] };
    };
    const boxes = body.requestedShipment.requestedPackageLineItems.reduce((s, p) => s + (p.groupPackageCount ?? 1), 0);
    fedexPackagesSeen.push(boxes);
    fedexZipsSeen.push(body.requestedShipment.recipient.address.postalCode);
    const charge = fedexFlatDollars ?? FEDEX_DOLLARS_PER_BOX * boxes;
    return Response.json({ output: { rateReplyDetails: [{ ratedShipmentDetails: [{ totalNetCharge: charge }] }] } });
  }
  throw new Error(`unstubbed fetch (would hit the network): ${url}`);
}) as typeof fetch;

// ---- stubbed Workers Cache (caches.default) --------------------------------
const cacheMap = new Map<string, string>();
const cachePutHeaders: string[] = [];
let cacheMode: "ok" | "throws" = "ok";
const fakeCaches = {
  default: {
    async match(req: Request): Promise<Response | undefined> {
      if (cacheMode === "throws") throw new Error("cache down");
      const hit = cacheMap.get(req.url);
      return hit === undefined ? undefined : new Response(hit);
    },
    async put(req: Request, res: Response): Promise<void> {
      if (cacheMode === "throws") throw new Error("cache down");
      cachePutHeaders.push(res.headers.get("Cache-Control") ?? "");
      cacheMap.set(req.url, await res.text());
    },
  },
};
(globalThis as { caches?: unknown }).caches = fakeCaches;
const resetCache = (): void => { cacheMap.clear(); };

const ENV = {
  STRIPE_SECRET_KEY: "sk_test_fake_not_real",
  FEDEX_CLIENT_ID: "id",
  FEDEX_CLIENT_SECRET: "secret",
  FEDEX_ACCOUNT_NUMBER: "000",
};

const FEDEX = 9550; // one stand box, stubbed live rate
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

async function calc(items: unknown, destination: { zip: unknown; state: unknown }): Promise<{ status: number; total?: number }> {
  const res = await (calcShipping as unknown as (c: unknown) => Promise<Response>)({
    request: new Request("https://example.test/api/calculate-shipping", {
      method: "POST",
      body: JSON.stringify({ items, destination }),
    }),
    env: ENV,
  });
  const json = (await res.json()) as { total?: number };
  return { status: res.status, total: json.total };
}

function req(items: unknown, extra: Record<string, unknown> = {}, ship: Record<string, unknown> = DEST): Record<string, unknown> {
  return { items, shipping: ship, email: "buyer@example.test", ...extra };
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
  const SB = { id: "sb-1000", qty: 1 };
  const BB = { id: "bb-2000", qty: 1 };

  console.log("pricing cases (each stand is its own FedEx box)");
  await expectAmount("SB-1000 no code", [SB], undefined, FEDEX, 49500 + FEDEX);
  await expectAmount("SB-1000 PLATOS#1", [SB], "PLATOS#1", FEDEX, 35000 + FEDEX);
  await expectAmount("SB-1000 platos#1 (lowercase)", [SB], "platos#1", FEDEX, 35000 + FEDEX);
  await expectAmount("SB-1000 ' platos#1 ' (spaces)", [SB], " platos#1 ", FEDEX, 35000 + FEDEX);
  await expectAmount("BB-2000 no code (list 49500)", [BB], undefined, FEDEX, 49500 + FEDEX);
  await expectAmount("BB-2000 PLATOS#1", [BB], "PLATOS#1", FEDEX, 35000 + FEDEX);
  await expectAmount("SB x2 + BB x1 PLATOS#1 (3 boxes)", [{ id: "sb-1000", qty: 2 }, BB], "PLATOS#1", FEDEX * 3, 105000 + FEDEX * 3);
  await expectAmount(
    "stand + pc-plate + sb-pk PLATOS#1",
    [SB, { id: "pc-plate", qty: 1 }, { id: "sb-pk", qty: 1 }],
    "PLATOS#1", FEDEX + USPS, 35000 + 4500 + 4850 + FEDEX + USPS, // code discounts the stand only
  );
  await expectAmount("extras only bb-complete PLATOS#1 (no discount)", [{ id: "bb-complete", qty: 1 }], "PLATOS#1", USPS, 5000 + USPS);
  {
    // the code never changes the price of any extra: with code == without code == list
    const list: [string, number][] = [["pc-plate", 4500], ["sb-pk", 4850], ["bb-pk", 4250], ["bb-complete", 5000], ["sb-complete", 5350]];
    for (const [id, price] of list) {
      const withCode = await post(req([{ id, qty: 2 }], { promoCode: "PLATOS#1", shippingTotal: USPS }));
      const without = await post(req([{ id, qty: 2 }], { shippingTotal: USPS }));
      const a = withCode.stripe ? Number(withCode.stripe.get("amount")) : NaN;
      const b2 = without.stripe ? Number(without.stripe.get("amount")) : NaN;
      check(`${id} x2 is list price ${price * 2} + USPS with and without the code`, a === price * 2 + USPS && b2 === a && withCode.stripe?.get("metadata[discount]") === "0", `with=${a} without=${b2}`);
    }
    const mixed = await post(req([BB, { id: "pc-plate", qty: 1 }, { id: "bb-pk", qty: 1 }], { promoCode: "PLATOS#1", shippingTotal: FEDEX + USPS }));
    check("stand + plate + bb-pk with code: metadata discount is the stand's 14500 only", mixed.stripe?.get("metadata[discount]") === "14500" && Number(mixed.stripe?.get("amount")) === 35000 + 4500 + 4250 + FEDEX + USPS, `disc=${mixed.stripe?.get("metadata[discount]")}`);
  }
  await expectAmount("extras only, no code", [{ id: "bb-complete", qty: 1 }], undefined, USPS, 5000 + USPS);
  await expectAmount("wrong code PLATOS#2 = full price", [SB], "PLATOS#2", FEDEX, 49500 + FEDEX);
  await expectAmount("non-string promoCode = full price", [SB], 5 as unknown as string, FEDEX, 49500 + FEDEX);
  await expectAmount("duplicate ids merge (SB + SB = x2, 2 boxes)", [SB, SB], "PLATOS#1", FEDEX * 2, 70000 + FEDEX * 2);
  check("isValidPromoCode trims and ignores case", isValidPromoCode("  Platos#1\t") === true && isValidPromoCode("PLATOS# 1") === false && isValidPromoCode("") === false);

  console.log("per-stand FedEx boxes");
  resetCache();
  fedexPackagesSeen.length = 0;
  {
    const one = await calc([SB], { zip: "90210", state: "CA" });
    const two = await calc([{ id: "sb-1000", qty: 2 }], { zip: "90210", state: "CA" });
    const mixed = await calc([SB, BB], { zip: "90210", state: "CA" });
    check("1 stand = 1 box, live rate", one.total === FEDEX && fedexPackagesSeen[0] === 1, `total=${one.total} pk=${fedexPackagesSeen[0]}`);
    check("2 stands = 2x the one-stand rate; FedEx saw 2 packages", two.total === 2 * FEDEX && fedexPackagesSeen[1] === 2, `total=${two.total} pk=${fedexPackagesSeen[1]}`);
    check("SB + BB = 2 boxes", mixed.total === 2 * FEDEX && fedexPackagesSeen[2] === 2, `total=${mixed.total} pk=${fedexPackagesSeen[2]}`);
    const plate = await calc([SB, { id: "pc-plate", qty: 3 }], { zip: "90210", state: "CA" });
    check("1 stand + 3 plates = 1 FedEx box + 1 USPS box", plate.total === FEDEX + USPS && fedexPackagesSeen.length === 4 && fedexPackagesSeen[3] === 1, `total=${plate.total} seen=${fedexPackagesSeen.join(",")}`);
    const before = fedexRateCalls;
    const small = await calc([{ id: "pc-plate", qty: 1 }], { zip: "90210", state: "CA" });
    check("plate only = USPS only, no FedEx call", small.total === USPS && fedexRateCalls === before);
  }
  fedexMode = "fail";
  resetCache();
  {
    const one = await calc([SB], { zip: "90210", state: "CA" });
    const two = await calc([{ id: "sb-1000", qty: 2 }], { zip: "90210", state: "CA" });
    const withPlate = await calc([BB, { id: "pc-plate", qty: 1 }], { zip: "90210", state: "CA" });
    check("FedEx down: 1 stand = zone rate 8000", one.total === 8000, `got ${one.total}`);
    check("FedEx down: 2 stands = 2x zone (16000)", two.total === 16000, `got ${two.total}`);
    check("FedEx down: 1 stand + plate = 8000 + USPS", withPlate.total === 8000 + USPS, `got ${withPlate.total}`);
    check("fallback estimates are not cached", cacheMap.size === 0, `size=${cacheMap.size}`);
  }
  fedexMode = "ok";
  resetCache();
  {
    fedexFlatDollars = 999; // above $250 per box
    const one = await calc([SB], { zip: "90210", state: "CA" });
    fedexFlatDollars = 600; // 2 boxes, above $500
    const two = await calc([{ id: "sb-1000", qty: 2 }], { zip: "90210", state: "CA" });
    fedexFlatDollars = null;
    check("absurd live rate (1 box > $250) falls back to the zone rate", one.total === 8000, `got ${one.total}`);
    check("absurd live rate (2 boxes > $500) falls back to 2x zone", two.total === 16000, `got ${two.total}`);
    check("absurd rates are not cached", cacheMap.size === 0);
  }

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

  console.log("destination validation (400, no Stripe call, never a 409)");
  const bad: [string, unknown, unknown][] = [
    ["CA + NY ZIP 10001", "10001", "CA"],
    ["state XX", "90210", "XX"],
    ["ZIP 'abcd'", "abcd", "CA"],
    ["ZIP 4 digits", "9021", "CA"],
    ["ZIP 6 digits", "902101", "CA"],
    ["ZIP + 4 malformed", "90210-12", "CA"],
    ["PR territory 00901", "00901", "PR"],
    ["numeric ZIP (not a string)", 90210, "CA"],
    ["missing state", "90210", undefined],
    ["missing ZIP", undefined, "CA"],
    ["empty strings", "", ""],
    ["TX + CA ZIP", "90210", "TX"],
  ];
  for (const [label, zip, state] of bad) {
    const r = await post(req([SB], { shippingTotal: 1 }, { ...DEST, zip, state }));
    check(`create-payment-intent: ${label} -> 400, no Stripe call`, r.status === 400 && r.stripeCalls === 0, `status=${r.status}`);
    const c = await calc([SB], { zip, state });
    check(`calculate-shipping: ${label} -> 400`, c.status === 400, `status=${c.status}`);
  }
  console.log("contact field validation (400, no Stripe call)");
  {
    const long = "x".repeat(201);
    const cases: [string, Record<string, unknown>, Record<string, unknown>][] = [
      ["email without @", { email: "not-an-email" }, {}],
      ["email with spaces", { email: "a b@example.test" }, {}],
      ["email > 254 chars", { email: "a".repeat(250) + "@e.co" }, {}],
      ["name > 200 chars", {}, { name: long }],
      ["street > 200 chars", {}, { address: long }],
      ["empty city", {}, { city: "  " }],
      ["phone > 40 chars", { phone: "1".repeat(41) }, {}],
      ["phone not a string", { phone: 8183719006 }, {}],
    ];
    for (const [label, extra, ship] of cases) {
      const r = await post(req([SB], { shippingTotal: FEDEX, ...extra }, { ...DEST, ...ship }));
      check(`${label} -> 400, no Stripe call`, r.status === 400 && r.stripeCalls === 0, `status=${r.status}`);
    }
    const ok = await post(req([SB], { shippingTotal: FEDEX, phone: "(818) 371-9006" }));
    check("normal phone and email accepted", ok.status === 200 && ok.stripe?.get("metadata[ship_phone]") === "(818) 371-9006");
    const noPhone = await post(req([SB], { shippingTotal: FEDEX, phone: "" }));
    check("blank phone is sent as absent (no metadata[ship_phone])", noPhone.status === 200 && noPhone.stripe?.has("metadata[ship_phone]") === false);
  }
  {
    resetCache(); // force a live FedEx call so the request body can be inspected
    const zipsBefore = fedexZipsSeen.length;
    const r = await post(req([SB], { shippingTotal: FEDEX }, { ...DEST, zip: "90210-1234", state: " ca " }));
    check("state ' ca ' / ZIP+4 accepted and normalised to CA", r.status === 200 && r.stripe?.get("shipping[address][state]") === "CA" && r.stripe?.get("metadata[ship_state]") === "CA");
    check("ZIP+4 is sent to FedEx as the 5-digit ZIP", fedexZipsSeen.length === zipsBefore + 1 && fedexZipsSeen[fedexZipsSeen.length - 1] === "90210", fedexZipsSeen.join(","));
  }
  {
    const ok: [string, string][] = [["88510", "TX"], ["79901", "TX"], ["00501", "NY"], ["10001", "NY"], ["20001", "DC"], ["99201", "WA"], ["99501", "AK"]];
    const results = ok.map(([z, s]) => validateDestination(z, s).ok);
    check(`edge-region ZIPs accepted (${ok.length} samples)`, results.every(Boolean), results.join(","));
  }
  {
    const sample: Record<string, string> = {
      AL: "35203", AK: "99501", AZ: "85001", AR: "72201", CA: "90210", CO: "80202", CT: "06103", DE: "19901", DC: "20001", FL: "33101",
      GA: "30301", HI: "96813", ID: "83702", IL: "60601", IN: "46204", IA: "50309", KS: "66101", KY: "40202", LA: "70112", ME: "04101",
      MD: "21201", MA: "02108", MI: "48201", MN: "55401", MS: "39201", MO: "63101", MT: "59601", NE: "68102", NV: "89101", NH: "03301",
      NJ: "07030", NM: "87101", NY: "10001", NC: "27601", ND: "58102", OH: "43215", OK: "73102", OR: "97201", PA: "19103", RI: "02903",
      SC: "29401", SD: "57101", TN: "37203", TX: "75001", UT: "84101", VT: "05401", VA: "20147", WA: "98101", WV: "25301", WI: "53202", WY: "82001",
    };
    const states = Object.keys(sample);
    const allOk = states.every((s) => validateDestination(sample[s], s).ok);
    check(`one real ZIP per state accepted (${states.length} states + DC)`, states.length === 51 && allOk && US_STATE_CODES.length === 51);
    // each state accepts its own first digit and at most two first digits in total
    const accepted = (s: string): number => "0123456789".split("").filter((d) => validateDestination(`${d}0001`, s).ok).length;
    const counts = states.map(accepted);
    check(
      "each state accepts 1 or 2 ZIP first digits (51 states + DC), never all ten",
      counts.every((n) => n >= 1 && n <= 2) && states.every((s) => validateDestination(`${sample[s][0]}0001`, s).ok),
      counts.join(","),
    );
    check("foreign-region ZIPs rejected: 51 states x 9xxxx/1xxxx swap", states.every((s) => !validateDestination(sample[s][0] === "9" ? "10001" : "90210", s).ok));
  }

  console.log("shipping quote cache (Workers Cache API, 30 min)");
  resetCache();
  cachePutHeaders.length = 0;
  {
    const quote = await calc([SB], { zip: "90210", state: "CA" }); // FedEx ok -> cached
    check("live FedEx quote is cached with a 30 minute TTL", quote.total === FEDEX && cacheMap.size === 1 && cachePutHeaders[0] === "public, max-age=1800", `size=${cacheMap.size} h=${cachePutHeaders[0]}`);
    fedexMode = "fail"; // FedEx flaps between the quote and the pay call
    const authBefore = fedexAuthCalls;
    const r = await post(req([SB], { promoCode: "PLATOS#1", shippingTotal: FEDEX }, { ...DEST, zip: "90210" }));
    const amount = r.stripe ? Number(r.stripe.get("amount")) : NaN;
    check("FedEx ok on quote, FAILS on pay: no 409, charged the quoted shipping", r.status === 200 && amount === 35000 + FEDEX && r.json.shipping === FEDEX, `status=${r.status} amount=${amount}`);
    check("pay call was served from cache (no FedEx call)", fedexAuthCalls === authBefore);
    fedexMode = "ok";
  }
  {
    resetCache();
    const rateBefore = fedexRateCalls;
    await calc([SB, { id: "pc-plate", qty: 1 }], { zip: "90210", state: "CA" });
    const again = await calc([{ id: "pc-plate", qty: 1 }, SB], { zip: "90210-5555", state: "ca" });
    check("cache key ignores item order, ZIP+4 and state case", fedexRateCalls === rateBefore + 1 && again.total === FEDEX + USPS, `calls=${fedexRateCalls - rateBefore}`);
    const other = await calc([SB, { id: "pc-plate", qty: 1 }], { zip: "90211", state: "CA" });
    check("a different ZIP is a different cache key", fedexRateCalls === rateBefore + 2 && other.total === FEDEX + USPS);
  }
  {
    resetCache();
    fedexMode = "fail";
    const first = await post(req([SB], { shippingTotal: 8000 }, { ...DEST, zip: "90210" })); // quote saw the estimate
    check("FedEx down on quote: estimate charged consistently (no 409)", first.status === 200 && first.json.shipping === 8000);
    fedexMode = "ok";
    const second = await post(req([SB], { shippingTotal: 8000 }, { ...DEST, zip: "90210" }));
    check("FedEx back on pay: ONE 409 with the live number, nothing charged", second.status === 409 && second.json.shipping === FEDEX && second.stripeCalls === 0, `status=${second.status}`);
    fedexMode = "fail";
    const third = await post(req([SB], { shippingTotal: FEDEX }, { ...DEST, zip: "90210" }));
    check("pressing pay again with the new number succeeds even if FedEx flaps again", third.status === 200 && third.json.shipping === FEDEX, `status=${third.status}`);
    fedexMode = "ok";
  }
  {
    resetCache();
    cacheMode = "throws";
    const c = await calc([SB], { zip: "90210", state: "CA" });
    check("Cache API throwing does not break the quote", c.status === 200 && c.total === FEDEX, `status=${c.status}`);
    cacheMode = "ok";
    const saved = (globalThis as { caches?: unknown }).caches;
    (globalThis as { caches?: unknown }).caches = undefined;
    const d = await calc([SB], { zip: "90210", state: "CA" });
    check("no Cache API at all does not break the quote", d.status === 200 && d.total === FEDEX, `status=${d.status}`);
    (globalThis as { caches?: unknown }).caches = saved;
  }

  console.log("shipping: FedEx failure uses the zone fallback in BOTH routes");
  resetCache();
  fedexMode = "fail";
  for (const [state, zip, zone] of [["CA", "90210", 8000], ["TX", "75001", 12500], ["NY", "10001", 15000]] as const) {
    const c = await calc([SB], { zip, state });
    const r = await post(req([SB], { promoCode: "PLATOS#1", shippingTotal: zone }, { ...DEST, state, zip }));
    const amount = r.stripe ? Number(r.stripe.get("amount")) : NaN;
    check(
      `FedEx down, ${state}: calculate-shipping ${c.total} == intent shipping == ${zone}`,
      c.total === zone && r.status === 200 && r.json.shipping === zone && amount === 35000 + zone,
      `calc=${c.total} intent=${String(r.json.shipping)} amount=${amount}`,
    );
  }
  fedexMode = "ok";
  resetCache();
  {
    const j = await calc([SB, { id: "pc-plate", qty: 1 }], { zip: "91766", state: "CA" });
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
    const bad2 = await post(req([SB], { promoCode: "NOPE", shippingTotal: FEDEX }));
    check("metadata promoCode empty for an unapplied code", bad2.stripe?.get("metadata[promoCode]") === "");
  }

  console.log("validateItems");
  check("validateItems merges and keeps order", JSON.stringify(validateItems([{ id: "pc-plate", qty: 2 }, { id: "sb-pk", qty: 1 }, { id: "pc-plate", qty: 3 }])) ===
    JSON.stringify({ ok: true, items: [{ id: "pc-plate", qty: 5 }, { id: "sb-pk", qty: 1 }] }));

  console.log("one source of truth: no price or rate literals outside shared/");
  const roots = ["src", "functions"];
  const hits: string[] = [];
  // list prices, promo price, USPS rates, FedEx zone rates and the per-box ceiling
  const literals = /\b(49500|48950|4850|4250|5350|4500|5000|35000|1610|1040|2290|8000|10000|12500|15000|17500|25000)\b/;
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(name) && literals.test(readFileSync(p, "utf8"))) hits.push(p);
    }
  };
  roots.forEach(walk);
  check("no price/rate literals in src/ or functions/", hits.length === 0, hits.join(", "));
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
