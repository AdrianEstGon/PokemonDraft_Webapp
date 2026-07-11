// Counters now come from a static JSON that is refreshed daily by a GitHub Action
// scraping uniteapi.dev (see scripts/scrape-counters.mjs). No backend / manual
// configuration is involved anymore.

export interface CounterData {
  /** YYYY-MM-DD the data was produced. */
  generatedAt: string;
  /** ISO timestamp of the last refresh. */
  updatedAt: string;
  /** "uniteapi.dev" for live data, or "seed" for the heuristic fallback. */
  source: string;
  note?: string;
  /** normalizedName -> role */
  roles: Record<string, string>;
  /** matchups[A][B] = win % of A against B (0-100). */
  matchups: Record<string, Record<string, number>>;
}

const EMPTY: CounterData = {
  generatedAt: "",
  updatedAt: "",
  source: "unavailable",
  roles: {},
  matchups: {},
};

export const getCounterData = async (): Promise<CounterData> => {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}counters.json`, {
      cache: "no-cache",
    });
    if (!res.ok) throw new Error(`counters.json ${res.status}`);
    return (await res.json()) as CounterData;
  } catch (err) {
    console.error("Could not load counters.json", err);
    return EMPTY;
  }
};
