import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Button,
  Stack,
  Paper,
  Box,
  TableBody,
  Table,
  TableCell,
  TableRow,
  TableHead,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Fab,
  Tooltip,
  Autocomplete,
  TextField,
  CircularProgress, 
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { DraftAdvisor, type Counter } from "./DraftAdvisor";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import { getPokemons } from "../services/PokemonService";
import { getCounters } from "../services/CounterService";

type Team = "ALLY" | "ENEMY";
type Phase = "BAN" | "PICK";
type ClassFilter =
  | "ALL"
  | "Attacker"
  | "Defender"
  | "Supporter"
  | "All-Rounder"
  | "Speedster";

export default function App() {
  const [whoStarts, setWhoStarts] = useState<Team | null>(null);
  const [phase, setPhase] = useState<Phase>("BAN");
  const [step, setStep] = useState(0);
  const [classFilter, setClassFilter] = useState<ClassFilter>("ALL");

  const [allyBans, setAllyBans] = useState<string[]>([]);
  const [enemyBans, setEnemyBans] = useState<string[]>([]);
  const [allyPicks, setAllyPicks] = useState<string[]>([]);
  const [enemyPicks, setEnemyPicks] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [allPokemons, setAllPokemons] = useState<any[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

   // 1. Cargar pokemons
  useEffect(() => {
    setLoading(true);
    getPokemons()
      .then(setAllPokemons)
      .catch(console.error)
      .finally(() => setLoading(false)); // 👈 cuando termina se apaga el loader
  }, []);

  useEffect(() => {
    getCounters().then(setCounters).catch(console.error);
  }, []);

  // 2. Crear advisor
  const advisor = useMemo(() => new DraftAdvisor(counters), [counters]);

  // 3. Orden de bans y picks
  const banOrder: Team[] = whoStarts
    ? [
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

  const currentTeam: Team | null =
    phase === "BAN" ? banOrder[step] ?? null : pickOrder[step] ?? null;

  const totalSteps = phase === "BAN" ? banOrder.length : pickOrder.length;

  // 4. Filtrar pokemons disponibles
  const available = allPokemons.filter(
    (p) =>
      ![...allyBans, ...enemyBans, ...allyPicks, ...enemyPicks].includes(p.name) &&
      (classFilter === "ALL" || p.role === classFilter)
  );

  const filteredAvailable = available.filter((p) =>
    p.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // 5. Calcular recomendaciones
  const recommendations = useMemo(() => {
    if (phase === "PICK" && currentTeam === "ALLY") {
      return advisor.recommend(enemyPicks, filteredAvailable.map((p) => p.name));
    }
    return filteredAvailable.map((p) => ({ pokemon: p.name, score: 0 }));
  }, [phase, step, enemyPicks, filteredAvailable, advisor, currentTeam]);

  // 6. Ordenar disponibles según recomendación
  const sortedAvailable = [...filteredAvailable].sort(
    (a, b) =>
      recommendations.findIndex((r) => r.pokemon === a.name) -
      recommendations.findIndex((r) => r.pokemon === b.name)
  );

  // 7. Color por clase
  const getClassColor = (pokemonName: string) => {
    const p = allPokemons.find((p) => p.name === pokemonName);
    if (!p) return "#f0f0f0";
    switch (p.role) {
      case "Attacker":
        return "#ffcccc";
      case "Defender":
        return "#ccffcc";
      case "Supporter":
        return "#fff2cc";
      case "All-Rounder":
        return "#e6ccff";
      case "Speedster":
        return "#cce0ff";
      default:
        return "#f0f0f0";
    }
  };

  const handleSelect = (pokemon: string) => {
    if (!currentTeam) return;
    if (phase === "BAN") {
      currentTeam === "ALLY"
        ? setAllyBans((s) => [...s, pokemon])
        : setEnemyBans((s) => [...s, pokemon]);
    } else {
      currentTeam === "ALLY"
        ? setAllyPicks((s) => [...s, pokemon])
        : setEnemyPicks((s) => [...s, pokemon]);
    }
    if (step + 1 < totalSteps) setStep(step + 1);
    else if (phase === "BAN") {
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
  };

  const renderTableCell = (pokemonName?: string, isAlly?: boolean) => (
    <TableCell
      sx={{
        bgcolor: pokemonName ? getClassColor(pokemonName) : "transparent",
        textAlign: "center",
        height: 90,
        width: 90,
        p: 1,
        borderRadius: 3,
        borderRight: isAlly ? "3px solid rgba(0,0,0,0.3)" : "none",
      }}
    >
      {pokemonName && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <img
            src={allPokemons.find((p) => p.name === pokemonName)?.imageUrl}
            alt={pokemonName}
            style={{ width: 75, height: 75, objectFit: "contain" }}
          />
        </Box>
      )}
    </TableCell>
  );

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          bgcolor: "rgba(0,0,0,0.6)",
        }}
      >
        <CircularProgress size={80} thickness={4} />
        <Typography variant="h6" color="white">
          Loading Pokémon...
        </Typography>
      </Box>
    );
  }

  if (!whoStarts) {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 3,
        backgroundColor: "rgba(0, 0, 0, 0.6)", // semitransparente sobre el fondo
        padding: 3,
        boxSizing: "border-box",
      }}
    >
      <Container
        sx={{
          backgroundColor: "rgba(249, 248, 248, 0.6)", // fondo del contenido
          borderRadius: "50%",                        // hace el contenedor circular
          width: 500,                                  // ancho fijo
          height: 500,                                 // altura igual al ancho
          padding: 4,
          textAlign: "center",
          boxShadow: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h3" gutterBottom fontWeight="bold">
          Pokemon Unite Draft
        </Typography>
        <Typography variant="h5" gutterBottom>
          Who bans first?
        </Typography>
        <Stack direction="row" spacing={3} justifyContent="center" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setWhoStarts("ALLY")}
          >
            Allies
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={() => setWhoStarts("ENEMY")}
          >
            Enemies
          </Button>
        </Stack>
      </Container>

      <Tooltip title="Settings" placement="left">
        <Fab
          color="primary"
          onClick={() => navigate("/settings")}
          sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 10 }}
        >
          <SettingsIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
}


  // UI del draft principal
  return (
    <Container
      sx={{
        py: 2,
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 1200,
          height: "95%",
          p: 3,
          borderRadius: 3,
          boxShadow: 6,
          bgcolor: "rgba(255,255,255,0.85)",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "relative",
        }}
      >
        {/* Header */}
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            textAlign: "center",
            bgcolor: currentTeam === "ALLY" ? "primary.main" : "error.main",
            color: "white",
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            {currentTeam === "ALLY" ? "Allies" : "Enemies"}{" "}
            {phase === "BAN" ? "Ban" : "Pick"}
          </Typography>
        </Paper>

        {/* Layout: Bans, Picks y Disponibles */}
        <Grid container spacing={2} sx={{ flex: 1 }}>
          {/* Bans */}
          <Grid item xs={3}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 4, display: "inline-block" }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Bans
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", fontWeight: "bold" }}>Allies</TableCell>
                    <TableCell sx={{ bgcolor: "error.main", color: "white", textAlign: "center", fontWeight: "bold" }}>Enemies</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[0, 1].map((i) => (
                    <TableRow key={i}>
                      {renderTableCell(allyBans[i], true)}
                      {renderTableCell(enemyBans[i], false)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Draft Picks */}
          <Grid item xs={3}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 4, display: "inline-block" }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Draft Picks
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", fontWeight: "bold" }}>Allies</TableCell>
                    <TableCell sx={{ bgcolor: "error.main", color: "white", textAlign: "center", fontWeight: "bold" }}>Enemies</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {renderTableCell(allyPicks[i], true)}
                      {renderTableCell(enemyPicks[i], false)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>

          {/* Disponibles */}
          <Grid item xs={6} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, height: "100%" }}>
            <Box sx={{ mb: 1, width: "100%", display: "flex", gap: 1 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>Filter by class</InputLabel>
                <Select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value as ClassFilter)}
                  label="Filter by class"
                >
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="Attacker">Attacker</MenuItem>
                  <MenuItem value="Defender">Defender</MenuItem>
                  <MenuItem value="Supporter">Supporter</MenuItem>
                  <MenuItem value="All-Rounder">All-Rounder</MenuItem>
                  <MenuItem value="Speedster">Speedster</MenuItem>
                </Select>
              </FormControl>

              <Autocomplete
                sx={{ flex: 1 }}
                options={allPokemons.map((p) => p.name)}
                inputValue={searchText}
                onInputChange={(_, value) => setSearchText(value)}
                renderInput={(params) => <TextField {...params} label="Search Pokémon" />}
                freeSolo
                clearOnEscape
              />
            </Box>

            <Typography variant="h6" gutterBottom fontWeight="bold">
              Available Pokémon
            </Typography>

            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 1.5,
                p: 1,
                overflowY: "auto",
                maxHeight: 5 * 90 + 1.5 * 4,
              }}
            >
              {sortedAvailable.map((p) => (
                <Button
                  key={p.name}
                  variant="outlined"
                  sx={{
                    minWidth: 90,
                    minHeight: 90,
                    p: 1,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": { transform: "scale(1.08)", boxShadow: 4 },
                  }}
                  onClick={() => handleSelect(p.name)}
                >
                  <img src={p.imageUrl} alt={p.name} style={{ width: 75, height: 75, objectFit: "contain" }} />

                  {phase === "PICK" && currentTeam === "ALLY" && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: () => {
                          const score = recommendations.find((r) => r.pokemon === p.name)?.score ?? 0;
                          const green = Math.round((score / 100) * 255);
                          const red = 255 - green;
                          return `rgba(${red}, ${green}, 0, 0.8)`;
                        },
                        color: "white",
                        fontSize: "0.75rem",
                        px: 0.6,
                        py: 0.2,
                        borderRadius: 1,
                        fontWeight: "bold",
                      }}
                    >
                      {recommendations.find((r) => r.pokemon === p.name)?.score.toFixed(0) ?? 0}
                    </Box>
                  )}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Botón Restart */}
        <Tooltip title="Restart draft" placement="left">
          <Fab color="secondary" onClick={reset} sx={{ position: "absolute", bottom: 24, right: 24, zIndex: 10 }}>
            <RestartAltIcon />
          </Fab>
        </Tooltip>
      </Paper>
    </Container>
  );
}
