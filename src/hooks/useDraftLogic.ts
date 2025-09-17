import { useEffect, useMemo, useState } from "react";
import { DraftAdvisor, type Counter } from "../pages/draft/DraftAdvisor";
import { getPokemons } from "../services/PokemonService";
import { getCounters } from "../services/CounterService";
import { getUserPokemons } from "../services/BagService";

type Team = "ALLY" | "ENEMY";
type Phase = "ALLY_BANS" | "ENEMY_BANS" | "ASK_FIRST_PICK" | "PICK";
type ClassFilter =
  | "ALL"
  | "Attacker"
  | "Defender"
  | "Supporter"
  | "All-Rounder"
  | "Speedster";

type DraftState = {
  phase: Phase;
  step: number;
  whoStarts: Team | null;
  allyBans: any[];
  enemyBans: any[];
  allyPicks: any[];
  enemyPicks: any[];
};

export function useDraftLogic() {
  const [whoStarts, setWhoStarts] = useState<Team | null>(null);
  const [phase, setPhase] = useState<Phase>("ALLY_BANS");
  const [step, setStep] = useState(0);

  const [classFilter, setClassFilter] = useState<ClassFilter>("ALL");
  const [onlyMyPokemons, setOnlyMyPokemons] = useState(false);

  const [allyBans, setAllyBans] = useState<any[]>([]);
  const [enemyBans, setEnemyBans] = useState<any[]>([]);
  const [allyPicks, setAllyPicks] = useState<any[]>([]);
  const [enemyPicks, setEnemyPicks] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");
  const [allPokemons, setAllPokemons] = useState<any[]>([]);
  const [userPokemons, setUserPokemons] = useState<string[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);

  const [, setHistory] = useState<DraftState[]>([]);

  const userId = localStorage.getItem("userId");

  // Guarda snapshot del estado actual en history
  const saveSnapshot = () => {
    setHistory((prev) => [
      ...prev,
      {
        phase,
        step,
        whoStarts,
        allyBans,
        enemyBans,
        allyPicks,
        enemyPicks,
      },
    ]);
  };

  // Cargar pokemons y counters
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getPokemons().then(setAllPokemons),
      userId
        ? getUserPokemons(Number(userId)).then((p: any[]) =>
            setUserPokemons(p.map((x) => x.name))
          )
        : Promise.resolve([]),
      getCounters().then(setCounters),
    ])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const advisor = useMemo(() => new DraftAdvisor(counters), [counters]);

  const pickOrder = useMemo(() => {
    if (!whoStarts) return [];
    const other: Team = whoStarts === "ALLY" ? "ENEMY" : "ALLY";
    return [
      whoStarts, // 1
      other, // 2
      other, // 3
      whoStarts, // 4
      whoStarts, // 5
      other, // 6
      other, // 7
      whoStarts, // 8
      whoStarts, // 9
      other, // 10
    ];
  }, [whoStarts]);

  const currentTeam: Team | null = useMemo(() => {
    if (phase === "ALLY_BANS") return "ALLY";
    if (phase === "ENEMY_BANS") return "ENEMY";
    if (phase === "ASK_FIRST_PICK") return null;
    if (phase === "PICK") return pickOrder[step] ?? null;
    return null;
  }, [phase, step, pickOrder]);

  const totalSteps = useMemo(() => {
    if (phase === "ALLY_BANS" || phase === "ENEMY_BANS") return 3;
    if (phase === "PICK") return pickOrder.length;
    return 0;
  }, [phase, pickOrder]);

  const available = useMemo(() => {
    const bannedForPick = [...allyBans, ...enemyBans].map((x) => x.name);

    return allPokemons.filter((p) => {
      const alreadyPicked = [...allyPicks, ...enemyPicks].some(
        (x) => x.name === p.name
      );
      const banned = phase === "PICK" ? bannedForPick.includes(p.name) : false;
      const classOk = classFilter === "ALL" || p.role === classFilter;
      const myPokemonOk = !onlyMyPokemons || userPokemons.includes(p.name);

      return !alreadyPicked && !banned && classOk && myPokemonOk;
    });
  }, [
    allPokemons,
    allyBans,
    enemyBans,
    allyPicks,
    enemyPicks,
    classFilter,
    onlyMyPokemons,
    userPokemons,
    phase,
  ]);

  const filteredAvailable = useMemo(() => {
    return available.filter((p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [available, searchText]);

  const recommendations = useMemo(() => {
  const baseRecs =
    phase === "PICK" && currentTeam === "ALLY"
      ? advisor.recommend(
          enemyPicks.map((p) => p.name),
          filteredAvailable.map((p) => p.name)
        )
      : filteredAvailable.map((p) => ({ pokemon: p.name, score: 0 }));

  return baseRecs.map((rec) => {
    const pokemon = allPokemons.find((p) => p.name === rec.pokemon);
    if (!pokemon) return rec;

    let tierBonus = 0;
    switch (pokemon.tier) {
      case "S":
        tierBonus = 3;
        break;
      case "A":
        tierBonus = 1;
        break;
      case "B":
        tierBonus = -1;
        break;
      case "C":
        tierBonus = -3;
        break;
    }

    return { ...rec, score: rec.score + tierBonus };
  });
}, [phase, step, enemyPicks, filteredAvailable, advisor, currentTeam, allPokemons]);


  const sortedAvailable = useMemo(() => {
  return [...filteredAvailable].sort((a, b) => {
    const scoreA =
      recommendations.find((r) => r.pokemon === a.name)?.score ?? -Infinity;
    const scoreB =
      recommendations.find((r) => r.pokemon === b.name)?.score ?? -Infinity;

    return scoreB - scoreA; // Mayor a menor
  });
}, [filteredAvailable, recommendations]);


  // Manejo de selección (ban o pick)
  const handleSelect = (pokemon: any) => {
    saveSnapshot(); // Guardar estado antes de modificar nada

    if (phase === "ALLY_BANS") {
      setAllyBans((prev) => [...prev, pokemon]);
      if (step + 1 < 3) {
        setStep((s) => s + 1);
      } else {
        setPhase("ENEMY_BANS");
        setStep(0);
      }
      return;
    }

    if (phase === "ENEMY_BANS") {
      setEnemyBans((prev) => [...prev, pokemon]);
      if (step + 1 < 3) {
        setStep((s) => s + 1);
      } else {
        setPhase("ASK_FIRST_PICK");
        setStep(0);
      }
      return;
    }

    if (phase === "PICK") {
      const team = currentTeam;
      if (!team) return;

      if (team === "ALLY") {
        setAllyPicks((prev) => [...prev, pokemon]);
      } else {
        setEnemyPicks((prev) => [...prev, pokemon]);
      }

      if (step + 1 < totalSteps) {
        setStep((s) => s + 1);
      }
      return;
    }
  };

  const undo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;

      const last = prev[prev.length - 1];

      setPhase(last.phase);
      setStep(last.step);
      setWhoStarts(last.whoStarts);
      setAllyBans(last.allyBans);
      setEnemyBans(last.enemyBans);
      setAllyPicks(last.allyPicks);
      setEnemyPicks(last.enemyPicks);

      return prev.slice(0, -1);
    });
  };

  const commitFirstPick = (team: Team) => {
    saveSnapshot();
    setWhoStarts(team);
    setPhase("PICK");
    setStep(0);
  };

  const reset = () => {
    setWhoStarts(null);
    setPhase("ALLY_BANS");
    setStep(0);
    setAllyBans([]);
    setEnemyBans([]);
    setAllyPicks([]);
    setEnemyPicks([]);
    setClassFilter("ALL");
    setOnlyMyPokemons(false);
    setSearchText("");
    setHistory([]);
  };

  return {
    loading,
    whoStarts,
    setWhoStarts: commitFirstPick,
    phase,
    step,
    classFilter,
    setClassFilter,
    onlyMyPokemons,
    setOnlyMyPokemons,
    allyBans,
    enemyBans,
    allyPicks,
    enemyPicks,
    searchText,
    setSearchText,
    allPokemons,
    sortedAvailable,
    recommendations,
    currentTeam,
    handleSelect,
    reset,
    undo,
  };
}
