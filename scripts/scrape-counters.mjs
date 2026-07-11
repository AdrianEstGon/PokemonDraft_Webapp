// Daily scraper for Pokémon Unite counter percentages from uniteapi.dev.
//
// uniteapi.dev sits behind Cloudflare's bot challenge, so a plain fetch is blocked
// (HTTP 403 "Just a moment..."). We drive a real headless Chromium via Playwright,
// let the challenge clear, then read the counters off the rendered page.
//
// Output: public/counters.json  (same shape as scripts/gen-seed.mjs)
//   { generatedAt, updatedAt, source, roles, matchups: { A: { B: winPctOfAvsB } } }
//
// Safety: if scraping yields too little data, we DO NOT overwrite the existing file
// (seed or previous good scrape). This keeps the app working even when the site
// changes its markup or blocks us. Tune SELECTORS below after inspecting a real run
// (run headed locally with HEADLESS=0 to watch it).
//
//   npm run scrape:counters
//
import { chromium } from "playwright";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ROSTER, normalizeName } from "./roster.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, "../public/counters.json");
const BASE = "https://uniteapi.dev";
const HEADLESS = process.env.HEADLESS !== "0";
const MIN_MATCHUPS = 200; // below this we treat the scrape as failed and keep the seed

const ROLE_BY_KEY = Object.fromEntries(ROSTER.map(([n, r]) => [normalizeName(n), r]));
const NAME_BY_KEY = Object.fromEntries(ROSTER.map(([n]) => [normalizeName(n), n]));

// Map an arbitrary label/slug from the site to our canonical roster name.
function canonical(label) {
  const key = normalizeName(label);
  if (NAME_BY_KEY[key]) return NAME_BY_KEY[key];
  // try loose contains match (handles "Alolan Ninetales" vs "Ninetales (Alola)")
  for (const k of Object.keys(NAME_BY_KEY)) {
    if (key && (key.includes(k) || k.includes(key)) && Math.abs(key.length - k.length) <= 4) {
      return NAME_BY_KEY[k];
    }
  }
  return null;
}

async function passChallenge(page) {
  // Give Cloudflare time to run its JS challenge and redirect to real content.
  for (let i = 0; i < 20; i++) {
    const title = await page.title().catch(() => "");
    if (!/just a moment|attention required|checking your browser/i.test(title)) return true;
    await page.waitForTimeout(1500);
  }
  return false;
}

// Best-effort extraction. uniteapi renders a grid of Pokémon; selecting one shows
// its counters with a percentage each. We iterate the roster, open each Pokémon's
// counters view and read the numbers. Adjust the selectors here once you can see a
// real page (they are intentionally broad).
async function scrapeOne(page, name) {
  const key = normalizeName(name);
  const urls = [
    `${BASE}/en/pokemon/${key}/counters`,
    `${BASE}/en/counters?pokemon=${key}`,
    `${BASE}/en/counters/${key}`,
  ];
  for (const url of urls) {
    try {
      const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
      if (!resp || resp.status() >= 400) continue;
      await passChallenge(page);
      // Grab every element that pairs a Pokémon reference (img alt / link) with a %.
      const pairs = await page.evaluate(() => {
        const out = [];
        const pctRe = /(\d{1,3}(?:\.\d)?)\s*%/;
        const cards = Array.from(
          document.querySelectorAll(
            "[class*='counter'] a, [class*='counter'] [class*='card'], [class*='matchup'] *"
          )
        );
        for (const el of cards) {
          const text = el.textContent || "";
          const m = text.match(pctRe);
          if (!m) continue;
          const img = el.querySelector("img");
          const label =
            (img && (img.getAttribute("alt") || img.getAttribute("title"))) ||
            el.getAttribute("data-name") ||
            (el.getAttribute("href") || "").split("/").filter(Boolean).pop() ||
            "";
          if (label) out.push({ label, pct: parseFloat(m[1]) });
        }
        return out;
      });
      if (pairs.length) return pairs;
    } catch {
      /* try next url */
    }
  }
  return [];
}

async function main() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
    viewport: { width: 1366, height: 900 },
    locale: "en-US",
  });
  const page = await context.newPage();

  // Warm up + clear the challenge once on the landing counters page.
  await page.goto(`${BASE}/en/counters`, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await passChallenge(page);

  const matchups = {};
  let total = 0;
  for (const [name] of ROSTER) {
    const pairs = await scrapeOne(page, name);
    if (!pairs.length) continue;
    matchups[name] = matchups[name] || {};
    for (const { label, pct } of pairs) {
      const opp = canonical(label);
      if (!opp || opp === name) continue;
      // uniteapi lists how often the OPPONENT counters this pokemon; store our win %.
      // If their number is "counter rate against `name`", our win% = 100 - that.
      // Adjust this line if the site's semantics differ.
      matchups[name][opp] = Math.max(0, Math.min(100, Math.round(100 - pct)));
      total++;
    }
    process.stderr.write(`  ${name}: ${Object.keys(matchups[name]).length} counters\n`);
  }

  await browser.close();

  if (total < MIN_MATCHUPS) {
    console.error(
      `Scrape produced only ${total} matchups (< ${MIN_MATCHUPS}); keeping existing counters.json. ` +
        `The site markup likely changed — inspect a headed run (HEADLESS=0) and update the selectors.`
    );
    // Keep whatever is already there (seed or last good scrape).
    if (existsSync(OUT_FILE)) process.exit(0);
    process.exit(1);
  }

  const out = {
    generatedAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
    source: "uniteapi.dev",
    note: "Scraped daily from https://uniteapi.dev/en/counters",
    roles: ROLE_BY_KEY,
    matchups,
  };
  writeFileSync(OUT_FILE, JSON.stringify(out, null, 0));
  console.log(`Wrote ${OUT_FILE} (${total} matchups from uniteapi.dev).`);
}

main().catch((err) => {
  console.error("Scrape failed:", err?.message || err);
  // Never destroy a working file on error.
  process.exit(existsSync(OUT_FILE) ? 0 : 1);
});
