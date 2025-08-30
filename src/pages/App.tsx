import { useEffect, useState } from "react";
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
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
// Import PokemonService (adjust the path if needed)
import { getPokemons } from "../services/PokemonService";
type Team = "ALLY" | "ENEMY";
type Phase = "BAN" | "PICK";
type ClassFilter =
  | "ALL"
  | "Attacker"
  | "Defender"
  | "Supporter"
  | "All-rounder"
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
  const [searchText, setSearchText] = useState(""); // nuevo estado para filtrar
  const [allPokemons, setAllPokemons] = useState<any[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
  const fetchPokemons = async () => {
    try {
      const data = await getPokemons();
      setAllPokemons(data); // data vendrá de tu API
    } catch (error) {
      console.error("Error loading pokemons:", error);
    }
  };

  fetchPokemons();
}, []);


// Función para obtener color según clase
const getClassColor = (pokemonName: string) => {
  const p = allPokemons.find(p => p.name === pokemonName);
  if (!p) return "#f0f0f0";

  switch (p.role) {
    case "Attacker": return "#ffcccc"; 
    case "Defender": return "#ccffcc"; 
    case "Supporter": return "#fff2cc"; 
    case "All-Rounder": return "#e6ccff"; 
    case "Speedster": return "#cce0ff"; 
    default: return "#f0f0f0";
  }
};


  // Remove this duplicate declaration. The allPokemons state is already defined and populated via useEffect.

  const pickedOrBanned = new Set([
    ...allyBans,
    ...enemyBans,
    ...allyPicks,
    ...enemyPicks,
  ]);
// Filtra los Pokémon según la clase seleccionada
const available = allPokemons.filter((p) => {
  if (pickedOrBanned.has(p.name)) return false;

  if (classFilter === "ALL") return true;
  return p.role === classFilter; // comparar con role exacto
});



    // Filtra los Pokémon según la clase seleccionada y el texto de búsqueda
    const filteredAvailable = available.filter((p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase())
    );

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
    else phase === "BAN" ? (setPhase("PICK"), setStep(0)) : null;
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

  // Dentro de renderTableCell
const renderTableCell = (pokemonName?: string, isAlly?: boolean) => (
  <TableCell
    sx={{
      bgcolor: pokemonName ? getClassColor(pokemonName) : "transparent",
      textAlign: "center",
      height: 90,
      width: 90,
      p: 1,
      borderRadius: 3,
      borderRight: isAlly ? "3px solid rgba(0,0,0,0.3)" : "none", // línea separadora clara
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


if (!whoStarts) {
  return (
    <Container
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* SOLO se ve aquí el título */}
      <Typography variant="h3" gutterBottom fontWeight="bold">
        Pokemon Unite Draft
      </Typography>
      <Typography variant="h5" gutterBottom>
        Who bans first?
      </Typography>
      <Stack direction="row" spacing={3}>
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

       {/* Settings FAB */}
      <Tooltip title="Settings" placement="left">
        <Fab
          color="primary"
          onClick={() => navigate("/settings")}
          sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 10 }}
        >
          <SettingsIcon />
        </Fab>
      </Tooltip>
    </Container>
  );
}

return (
  <Container
    sx={{
      py: 2,
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: "100%",
    }}
  >
    {/* Turno actual destacado */}
    <Paper
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 3,
        boxShadow: 4,
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

    <Grid container spacing={2} marginTop={3} sx={{ flex: 1, width: "100%"}}>
  {/* Columna 1: Bans */}
  <Grid item xs={3}>
    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 4, display: "inline-block" }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Bans
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                bgcolor: "primary.main",
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Allies
            </TableCell>
            <TableCell
              sx={{
                bgcolor: "error.main",
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Enemies
            </TableCell>
          </TableRow>
        </TableHead>
        {/* Bans */}
        <TableBody>
          {[0, 1].map((i) => (
            <TableRow key={i}>
              {renderTableCell(allyBans[i], true)}   {/* Ally con separador */}
              {renderTableCell(enemyBans[i], false)} {/* Enemy sin separador */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  </Grid>

  {/* Columna 2: Draft Picks */}
  <Grid item xs={3}>
    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 4, display: "inline-block" }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Draft Picks
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                bgcolor: "primary.main",
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Allies
            </TableCell>
            <TableCell
              sx={{
                bgcolor: "error.main",
                color: "white",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Enemies
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            {renderTableCell(allyPicks[i], true)}   {/* Ally con separador */}
            {renderTableCell(enemyPicks[i], false)} {/* Enemy sin separador */}
          </TableRow>
        ))}
      </TableBody>
      </Table>
    </Paper>
  </Grid>

  {/* Columna 3: Pokémon disponibles */}
<Grid
  item
  xs={6}
  sx={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 1,
    height: "100%",
  }}
>
<Box sx={{ mb: 1, width: "100%", display: "flex", gap: 1 }}>
  {/* Filtro por clase */}
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


  {/* Autocomplete como filtro */}
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
      alignContent: "flex-start",
      gap: 1.5,
      p: 1,
      overflowY: "auto",        // scroll vertical
      maxHeight: 5 * 90 + 1.5 * 4, // 5 filas de 90px + gaps
    }}
  >
    {filteredAvailable.map((p) => (
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
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "scale(1.08)",
            boxShadow: 4,
          },
        }}
        onClick={() => handleSelect(p.name)}
      >
        <img
          src={p.imageUrl}
          alt={p.name}
          style={{
            width: 75,
            height: 75,
            objectFit: "contain",
          }}
        />

      </Button>
    ))}
  </Box>
</Grid>

</Grid>

    {/* Restart FAB */}
    <Tooltip title="Restart draft" placement="left">
      <Fab
        color="secondary"
        onClick={reset}
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 10 }}
      >
        <RestartAltIcon />
      </Fab>
    </Tooltip>
  </Container>
);
}