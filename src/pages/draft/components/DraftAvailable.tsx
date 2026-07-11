import { Box, Button, Typography, FormControl, InputLabel, Select, MenuItem, Autocomplete, TextField, Checkbox, FormControlLabel } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { roleColor } from "../../../theme";

type ClassFilter = "ALL" | "Attacker" | "Defender" | "Supporter" | "All-Rounder" | "Speedster";
type Phase = "ASK_FIRST_PICK" | "PICK";

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
  loading: boolean;
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
  loading,
}: DraftAvailableProps) {
  const [showLoading, setShowLoading] = useState(true);

  // 👇 Controlamos que el spinner se muestre al menos 3s
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowLoading(false), 2000); // mínimo 3s
      return () => clearTimeout(timer);
    } else {
      setShowLoading(true); // si vuelve a cargar, mostramos otra vez
    }
  }, [loading]);

  const getScore = (name: string) =>
    recommendations.find((r) => r.pokemon === name)?.score ?? 0;

  if (showLoading) {
    // 👇 Pokéball gigante girando
    return (
      <Box
        sx={{
          flex: 1,
          height: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.img
          src="/pokeball.png" // ⚠️ coloca una pokeball en public/
          alt="Loading Pokémons..."
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{ width: "min(60vw, 200px)", height: "auto" }}
        />
      </Box>
    );
  }

  // 👇 Render normal cuando ya cargó
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
            sx={{
              aspectRatio: "1 / 1",
              width: "100%",
              p: 1,
              borderRadius: 3,
              position: "relative",
              // 🎨 Fondo según el rol para diferenciar de un vistazo
              bgcolor: alpha(roleColor(p.role), 0.22),
              borderColor: alpha(roleColor(p.role), 0.55),
              boxShadow: `inset 0 -3px 0 ${alpha(roleColor(p.role), 0.75)}`,
              transition: "transform .12s ease, box-shadow .12s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                borderColor: roleColor(p.role),
                boxShadow: `inset 0 -3px 0 ${roleColor(p.role)}, 0 8px 20px rgba(0,0,0,0.45)`,
                bgcolor: alpha(roleColor(p.role), 0.32),
              },
            }}
          >
            <img
              src={p.imageUrl}
              alt={p.name}
              style={{ width: "70%", height: "70%", objectFit: "contain" }}
            />

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
