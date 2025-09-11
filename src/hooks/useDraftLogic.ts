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

export function useDraftLogic() {
  // whoStarts será null hasta que el usuario escoja quien hace el primer pick
  const [whoStarts, setWhoStarts] = useState<Team | null>(null);

  // fases: primero ally bans (3), luego enemy bans (3), luego ask first pick, luego picks
  const [phase, setPhase] = useState<Phase>("ALLY_BANS");
  // step para contar selections dentro de la fase actual (0..2 para bans, 0..n para picks)
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

  const userId = localStorage.getItem("userId");

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

  // pickOrder se calcula **cuando** whoStarts ya está definido
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

  // currentTeam depende de la fase:
  // - ALly bans => ALWAYS ALly until 3 bans
  // - ENEMY_BANS => ALWAYS ENEMY until 3 bans
  // - ASK_FIRST_PICK => null (no selection)
  // - PICK => pickOrder[step]
  const currentTeam: Team | null = useMemo(() => {
    if (phase === "ALLY_BANS") return "ALLY";
    if (phase === "ENEMY_BANS") return "ENEMY";
    if (phase === "ASK_FIRST_PICK") return null;
    if (phase === "PICK") return pickOrder[step] ?? null;
    return null;
  }, [phase, step, pickOrder]);

  // totalSteps para la fase actual (usado internamente)
  const totalSteps = useMemo(() => {
    if (phase === "ALLY_BANS" || phase === "ENEMY_BANS") return 3;
    if (phase === "PICK") return pickOrder.length;
    return 0;
  }, [phase, pickOrder]);

  // En available, excluir bans solamente durante PICK (durante bans queremos ver todo para banear)
  const available = useMemo(() => {
    const bannedForPick = [...allyBans, ...enemyBans].map((x) => x.name);

    return allPokemons.filter((p) => {
      const alreadyPicked = [...allyPicks, ...enemyPicks].some((x) => x.name === p.name);
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
    // Mantenemos la lógica anterior: solo recomendar cuando sea turno ALLY en PICK
    if (phase === "PICK" && currentTeam === "ALLY") {
      return advisor.recommend(
        enemyPicks.map((p) => p.name),
        filteredAvailable.map((p) => p.name)
      );
    }
    return filteredAvailable.map((p) => ({ pokemon: p.name, score: 0 }));
  }, [phase, step, enemyPicks, filteredAvailable, advisor, currentTeam]);

  const sortedAvailable = useMemo(() => {
    return [...filteredAvailable].sort(
      (a, b) =>
        recommendations.findIndex((r) => r.pokemon === a.name) -
        recommendations.findIndex((r) => r.pokemon === b.name)
    );
  }, [filteredAvailable, recommendations]);

  // Manejo de selección (ban o pick) según la fase actual
  const handleSelect = (pokemon: any) => {
    if (phase === "ALLY_BANS") {
      setAllyBans((prev) => [...prev, pokemon]);

      // avanza step; cuando llegue a 3 pasa a ENEMY_BANS
      if (step + 1 < 3) {
        setStep((s) => s + 1);
      } else {
        // terminado ally bans
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
        // terminado enemy bans → pedir primer pick
        setPhase("ASK_FIRST_PICK");
        setStep(0);
      }
      return;
    }

    // Si estamos en PICK, usamos pickOrder y añadimos picks según turn
    if (phase === "PICK") {
      const team = currentTeam;
      if (!team) return;

      if (team === "ALLY") {
        setAllyPicks((prev) => [...prev, pokemon]);
      } else {
        setEnemyPicks((prev) => [...prev, pokemon]);
      }

      // avanzar step dentro de picks
      if (step + 1 < totalSteps) {
        setStep((s) => s + 1);
      } else {
        // draft completado; podrías cambiar a una fase final si quisieras
        // por ahora no hacemos nada extra
      }
      return;
    }
  };

  // Cuando el usuario elige whoStarts (primer pick), se fija whoStarts y entramos en PICK
  const commitFirstPick = (team: Team) => {
    setWhoStarts(team);
    setPhase("PICK");
    setStep(0);
  };

  // reset completo
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
  };

  return {
    loading,
    whoStarts,
    setWhoStarts: commitFirstPick, // exportamos la función que fija primer pick y arranca picks
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
  };
}
