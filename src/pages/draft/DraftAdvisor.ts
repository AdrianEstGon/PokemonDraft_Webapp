export interface Recommendation {
  pokemon: string;
  score: number;
}

/** Normalised join key so "Alolan Ninetales" == "alolanninetales" etc. */
const norm = (s: string) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

export class DraftAdvisor {
  /** normalizedAlly -> (normalizedEnemy -> win% of ally vs enemy) */
  private index: Map<string, Map<string, number>>;

  constructor(matchups: Record<string, Record<string, number>>) {
    this.index = new Map();
    for (const [ally, row] of Object.entries(matchups || {})) {
      const m = new Map<string, number>();
      for (const [enemy, value] of Object.entries(row || {})) {
        m.set(norm(enemy), value);
      }
      this.index.set(norm(ally), m);
    }
  }

  /**
   * Win % of `ally` against `enemy` (0-100). 50 = neutral / unknown.
   */
  getCounterValue(ally: string, enemy: string): number {
    return this.index.get(norm(ally))?.get(norm(enemy)) ?? 50;
  }

  /**
   * Average matchup score of each available pick against the current enemy picks.
   * With no enemy picks yet, everything is neutral (0-delta) so ordering falls back
   * to tier/role logic applied by the caller.
   */
  recommend(enemyPicks: string[], availablePokemons: string[]): Recommendation[] {
    if (!enemyPicks.length) {
      return availablePokemons.map((p) => ({ pokemon: p, score: 0 }));
    }

    const recommendations = availablePokemons.map((ally) => {
      const total = enemyPicks.reduce(
        (sum, enemy) => sum + this.getCounterValue(ally, enemy),
        0
      );
      return { pokemon: ally, score: total / enemyPicks.length };
    });

    recommendations.sort((a, b) => b.score - a.score);
    return recommendations;
  }
}
