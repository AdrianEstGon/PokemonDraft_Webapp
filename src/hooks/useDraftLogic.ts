import { useEffect, useMemo, useState } from "react";
import { DraftAdvisor, type Counter } from "../pages/draft/DraftAdvisor";
import { getPokemons } from "../services/PokemonService";
import { getCounters } from "../services/CounterService";
import { getUserPokemons } from "../services/BagService";

type Team = "ALLY" | "ENEMY";
type Phase = "BAN" | "PICK";
type ClassFilter =
  | "ALL"
  | "Attacker"
  | "Defender"
  | "Supporter"
  | "All-Rounder"
  | "Speedster";

// useDraftLogic.ts
export function useDraftLogic(initialWhoStarts?: Team) {
  const [whoStarts, setWhoStarts] = useState<Team | null>(initialWhoStarts ?? null);
  const [phase, setPhase] = useState<Phase>("BAN");
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

  const banOrder: Team[] = whoStarts
  ? [
      whoStarts,
      whoStarts === "ALLY" ? "ENEMY" : "ALLY",
      whoStarts,
      whoStarts === "ALLY" ? "ENEMY" : "ALLY",
      whoStarts,
      whoStarts === "ALLY" ? "ENEMY" : "ALLY",
    ]
  : [];


  const pickOrder: Team[] = whoStarts
    ? [
        whoStarts,
        whoStarts === "ALLY" ? "ENEMY" : "ALLY",
        whoStarts === "ALLY" ? "ENEMY" : "ALLY",
        whoStarts,
        whoStarts,
        whoStarts === "ALLY" ? "ENEMY" : "ALLY",
        whoStarts === "ALLY" ? "ENEMY" : "ALLY",
        whoStarts,
        whoStarts,
        whoStarts === "ALLY" ? "ENEMY" : "ALLY",
      ]
    : [];

  // 🔹 Nunca null si whoStarts está definido
  const currentTeam: Team | null = whoStarts
    ? phase === "BAN"
      ? banOrder[step]
      : pickOrder[step]
    : null;

  const totalSteps = phase === "BAN" ? banOrder.length : pickOrder.length;

// En available, solo excluir bans durante PICK
const available = useMemo(() => {
  const bannedForPick = [...allyBans, ...enemyBans].map((x) => x.name);

  return allPokemons.filter((p) => {
    const alreadyPicked = [...allyPicks, ...enemyPicks].some((x) => x.name === p.name);
    const banned = phase === "PICK" ? bannedForPick.includes(p.name) : false; // 🔹 Solo excluir bans en PICK
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
  phase, // 🔹 importante incluir phase para que se recalcule al cambiar
]);


  const filteredAvailable = useMemo(() => {
    return available.filter((p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [available, searchText]);

  const recommendations = useMemo(() => {
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

  const handleSelect = (pokemon: any) => {
    if (!currentTeam) return;

    if (phase === "BAN") {
      currentTeam === "ALLY"
        ? setAllyBans((prev) => [...prev, pokemon])
        : setEnemyBans((prev) => [...prev, pokemon]);
    } else {
      currentTeam === "ALLY"
        ? setAllyPicks((prev) => [...prev, pokemon])
        : setEnemyPicks((prev) => [...prev, pokemon]);
    }

    if (step + 1 < totalSteps) {
      setStep(step + 1);
    } else if (phase === "BAN") {
      setPhase("PICK");
      setStep(0);
    }
  };

  const reset = () => {
    setWhoStarts(null);
    setPhase("BAN");
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
    setWhoStarts,
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
