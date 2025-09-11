import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Autocomplete, TextField, Checkbox, FormControlLabel } from "@mui/material";
import type { Dispatch, SetStateAction } from "react";

type ClassFilter = "ALL" | "Attacker" | "Defender" | "Supporter" | "All-Rounder" | "Speedster";

type Phase = "ALLY_BANS" | "ENEMY_BANS" | "ASK_FIRST_PICK" | "PICK";

interface DraftAvailableProps {
  available: any[];
  recommendations: { pokemon: string; score: number }[];
  phase: Phase;
  currentTeam: "ALLY" | "ENEMY" | null;
  onSelect: (pokemon: any) => void;
  classFilter: ClassFilter;
  setClassFilter: Dispatch<SetStateAction<ClassFilter>>;
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  onlyMyPokemons: boolean;
  setOnlyMyPokemons: Dispatch<SetStateAction<boolean>>;
}

export default function DraftAvailable({
  available,
  recommendations,
  phase,
  currentTeam,
  onSelect,
  classFilter,
  setClassFilter,
  searchText,
  setSearchText,
  onlyMyPokemons,
  setOnlyMyPokemons,
}: DraftAvailableProps) {

  const getScore = (name: string) =>
    recommendations.find((r) => r.pokemon === name)?.score ?? 0;

  return (
    <>
      <Box sx={{ mb: 1, width: "100%", display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1 }}>
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
          options={available.map((p: any) => p.name)}
          inputValue={searchText}
          onInputChange={(_, value) => setSearchText(value)}
          renderInput={(params) => <TextField {...params} label="Search Pokémon" />}
          freeSolo
          clearOnEscape
        />
      </Box>

      <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Available Pokemon
        </Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={onlyMyPokemons}
              onChange={(e) => setOnlyMyPokemons(e.target.checked)}
            />
          }
          label="Only my Pokemons"
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "repeat(auto-fill, minmax(80px, 1fr))", sm: "repeat(auto-fill, minmax(100px, 1fr))" },
          gap: 1.5,
          p: 1,
          overflowY: "auto",
          maxHeight: { xs: "50vh", md: 5 * 90 + 1.5 * 4 },
        }}
      >
        {available.map((p: any) => (
          <Button
            key={p.name}
            variant="outlined"
            onClick={() => onSelect(p)}
            sx={{ aspectRatio: "1 / 1", width: "100%", p: 1, borderRadius: 3, position: "relative" }}
          >
            <img
              src={p.imageUrl}
              alt={p.name}
              style={{ width: "70%", height: "70%", objectFit: "contain" }}
            />

            {/* Score badge solo si es turno de PICK y equipo ALLY */}
            {phase === "PICK" && currentTeam === "ALLY" && (
              <Box
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  bgcolor: getScore(p.name) >= 60 ? "#4caf50" : getScore(p.name) >= 40 ? "#ffeb3b" : "#f44336",
                  color: getScore(p.name) >= 60 ? "white" : "black",
                  fontSize: 10,
                  fontWeight: "bold",
                  px: 0.5,
                  borderRadius: 1,
                }}
              >
                {Math.round(getScore(p.name))}
              </Box>
            )}
          </Button>
        ))}
      </Box>
    </>
  );
}
