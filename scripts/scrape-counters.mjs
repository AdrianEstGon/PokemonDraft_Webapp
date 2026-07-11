// Daily scraper for Pokémon Unite counter percentages from uniteapi.dev.
//
// Page structure (https://uniteapi.dev/en/counters): one table listing every
// Pokémon with its top "Strong against" (3, green, >50%) and "Weak against"
// (3, red, <50%) opponents. The percentage shown is that Pokémon's win rate vs
// the opponent, so we record it directly as matchups[pokemon][opponent] = pct.
//
// uniteapi.dev sits behind Cloudflare's bot challenge, so a plain fetch is blocked
// (HTTP 403 "Just a moment..."). We drive a real headless Chromium via Playwright,
// let the challenge clear, then read the table off the rendered page.
//
// Output: public/counters.json  (same shape as scripts/gen-seed.mjs)
//   { generatedAt, updatedAt, source, roles, matchups: { A: { B: winPctOfAvsB } } }
//
// Safety: if scraping yields too little data, we DO NOT overwrite the existing file
// (seed or previous good scrape). Run headed locally to watch/adjust selectors:
//   HEADLESS=0 npm run scrape:counters
//
import { chromium } from "playwright";
import { writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ROSTER, normalizeName } from "./roster.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_FILE = resolve(__dirname, "../public/counters.json");
const URL = "https://uniteapi.dev/en/counters";
const HEADLESS = process.env.HEADLESS !== "0";
const MIN_POKEMON = 30; // below this we treat the scrape as failed and keep the seed

const ROLE_BY_KEY = Object.fromEntries(ROSTER.map(([n, r]) => [normalizeName(n), r]));
const NAME_BY_KEY = Object.fromEntries(ROSTER.map(([n]) => [normalizeName(n), n]));

// Map an arbitrary label/slug from the site to our canonical roster name.
function canonical(label) {
  const key = normalizeName(label);
  if (!key) return null;
  if (NAME_BY_KEY[key]) return NAME_BY_KEY[key];
  for (const k of Object.keys(NAME_BY_KEY)) {
    if ((key.includes(k) || k.includes(key)) && Math.abs(key.length - k.length) <= 4) {
      return NAME_BY_KEY[k];
    }
  }
  return label; // keep the raw label so we don't silently drop unknown/new Pokémon
}

async function passChallenge(page) {
  for (let i = 0; i < 25; i++) {
    const title = await page.title().catch(() => "");
    if (!/just a moment|attention required|checking your browser/i.test(title)) return true;
    await page.waitForTimeout(1500);
  }
  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
    viewport: { width: 1440, height: 1000 },
    locale: "en-US",
  });
  const page = await context.newPage();

  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await passChallenge(page);
  // Give the client-side table time to render, then make sure everything is loaded.
  await page.waitForTimeout(3000);
  await page.mouse.wheel(0, 20000).catch(() => {});
  await page.waitForTimeout(1500);

  // Extract one entry per table row: the subject Pokémon (first image/name in the
  // row) plus every opponent image paired with its percentage. The % is the
  // subject's win rate against that opponent.
  const rows = await page.evaluate(() => {
    const pctRe = /(\d{1,3}(?:\.\d)?)\s*%/;
    const nameFromImg = (img) =>
      (img && (img.getAttribute("alt") || img.getAttribute("title"))) || "";

    // Rows are <tr> in the table, or repeated fl/ grid rows. Try <tr> first.
    let rowEls = Array.from(document.querySelectorAll("table tr"));
    if (rowEls.length < 5) {
      rowEls = Array.from(
        document.querySelectorAll("[class*='row'],[class*='Row']")
      ).filter((el) => el.querySelector("img"));
    }

    const out = [];
    for (const row of rowEls) {
      const imgs = Array.from(row.querySelectorAll("img")).filter((i) =>
        nameFromImg(i)
      );
      if (imgs.length < 2) continue;

      const subject = nameFromImg(imgs[0]);
      if (!subject) continue;

      const opponents = [];
      for (let k = 1; k < imgs.length; k++) {
        const img = imgs[k];
        // Find a % near this image (in its cell / parent chain).
        let node = img;
        let pct = null;
        for (let up = 0; up < 4 && node; up++) {
          const m = (node.textContent || "").match(pctRe);
          if (m) { pct = parseFloat(m[1]); break; }
          node = node.parentElement;
        }
        const opp = nameFromImg(img);
        if (opp && pct != null) opponents.push({ opp, pct });
      }
      if (opponents.length) out.push({ subject, opponents });
    }
    return out;
  });

  await browser.close();

  const matchups = {};
  const seenPokemon = new Set();
  for (const { subject, opponents } of rows) {
    const a = canonical(subject);
    if (!a) continue;
    seenPokemon.add(a);
    matchups[a] = matchups[a] || {};
    for (const { opp, pct } of opponents) {
      const b = canonical(opp);
      if (!b || b === a) continue;
      matchups[a][b] = Math.max(0, Math.min(100, Math.round(pct * 10) / 10));
    }
  }

  // Reciprocal fill: if we know A beats B at X%, then B beats A at (100-X)%
  // unless the site gave us B-vs-A directly. Doubles matchup coverage.
  for (const a of Object.keys(matchups)) {
    for (const [b, v] of Object.entries(matchups[a])) {
      matchups[b] = matchups[b] || {};
      if (matchups[b][a] == null) {
        matchups[b][a] = Math.max(0, Math.min(100, Math.round((100 - v) * 10) / 10));
      }
    }
  }

  if (seenPokemon.size < MIN_POKEMON) {
    console.error(
      `Scrape found only ${seenPokemon.size} pokemon (< ${MIN_POKEMON}); keeping existing counters.json. ` +
        `The site markup likely changed — inspect a headed run (HEADLESS=0) and update the selectors.`
    );
    process.exit(existsSync(OUT_FILE) ? 0 : 1);
  }

  const out = {
    generatedAt: new Date().toISOString().slice(0, 10),
    updatedAt: new Date().toISOString(),
    source: "uniteapi.dev",
    note: "Scraped daily from https://uniteapi.dev/en/counters (Strong/Weak against win rates).",
    roles: ROLE_BY_KEY,
    matchups,
  };
  writeFileSync(OUT_FILE, JSON.stringify(out, null, 0));
  console.log(`Wrote ${OUT_FILE} (${seenPokemon.size} pokemon from uniteapi.dev).`);
}

main().catch((err) => {
  console.error("Scrape failed:", err?.message || err);
  process.exit(existsSync(OUT_FILE) ? 0 : 1);
});
