// Generates a heuristic fallback counters.json from the bundled roster.
// This is ONLY used until/if the daily uniteapi.dev scrape succeeds. Values are
// derived from a role-vs-role advantage model plus small deterministic jitter,
// so the app produces sensible pick recommendations out of the box.
//
//   node scripts/gen-seed.mjs [outfile]
//
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { ROSTER, normalizeName } from "./roster.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outFile = process.argv[2] || resolve(__dirname, "../public/counters.json");

// Advantage (percentage points above 50) of the ROW role against the COLUMN role.
// Antisymmetric: adv(a,b) === -adv(b,a). Same role -> 0.
const ADV = {
  Attacker:      { "All-Rounder": 5,  Defender: 2,  Speedster: -10, Supporter: 4 },
  "All-Rounder": { Attacker: -5,      Defender: 0,  Speedster: 8,   Supporter: 6 },
  Defender:      { Attacker: -2,      "All-Rounder": 0, Speedster: 9, Supporter: 3 },
  Speedster:     { Attacker: 10,      "All-Rounder": -8, Defender: -9, Supporter: 10 },
  Supporter:     { Attacker: -4,      "All-Rounder": -6, Defender: -3, Speedster: -10 },
};

const roleAdv = (a, b) => (a === b ? 0 : ADV[a]?.[b] ?? 0);

// Deterministic, antisymmetric jitter in [-3, 3] from the ordered name pair.
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function jitter(a, b) {
  const [lo, hi] = a < b ? [a, b] : [b, a];
  const sign = a < b ? 1 : -1;
  const j = (hash(lo + "|" + hi) % 7) - 3; // -3..3
  return sign * j;
}

const clamp = (v) => Math.max(20, Math.min(80, Math.round(v)));

const matchups = {};
for (const [nameA, roleA] of ROSTER) {
  matchups[nameA] = {};
  for (const [nameB, roleB] of ROSTER) {
    if (nameA === nameB) continue;
    matchups[nameA][nameB] = clamp(50 + roleAdv(roleA, roleB) + jitter(nameA, nameB));
  }
}

const out = {
  generatedAt: new Date().toISOString().slice(0, 10),
  updatedAt: new Date().toISOString(),
  source: "seed",
  note: "Heuristic fallback based on role match-ups. Replaced by the daily uniteapi.dev scrape.",
  roles: Object.fromEntries(ROSTER.map(([n, r]) => [normalizeName(n), r])),
  matchups,
};

writeFileSync(outFile, JSON.stringify(out, null, 0));
console.log(`Wrote ${outFile} (${ROSTER.length} pokemon, source=seed).`);
