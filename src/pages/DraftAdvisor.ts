export interface Counter {
  id: number;
  pokemonId: number;
  pokemonName: string;
  counterPokemonId: number;
  counterPokemonName: string;
  value: number;
}

export interface Recommendation {
  pokemon: string;
  score: number;
}

export class DraftAdvisor {
  private counters: Counter[];

  constructor(counters: Counter[]) {
    this.counters = counters;
  }

  /**
   * Busca el valor de counter de ally contra enemy.
   * Si no existe, devuelve 50 como neutro.
   */
  private getCounterValue(ally: string, enemy: string): number {
    const found = this.counters.find(
      (c) => c.pokemonName === ally && c.counterPokemonName === enemy
    );
    return found ? found.value : 50;
  }

  /**
   * Calcula recomendaciones basadas en los picks enemigos.
   */
  recommend(enemyPicks: string[], availablePokemons: string[]): Recommendation[] {
    if (!enemyPicks.length) {
      return availablePokemons.map((p) => ({ pokemon: p, score: 0 }));
    }

    const recommendations: Recommendation[] = [];

    availablePokemons.forEach((ally) => {
      let score = 0;

      enemyPicks.forEach((enemy) => {
        score += this.getCounterValue(ally, enemy);
      });

      // promedio
      score = score / enemyPicks.length;

      recommendations.push({ pokemon: ally, score });
    });

    recommendations.sort((a, b) => b.score - a.score);

    return recommendations;
  }
}
