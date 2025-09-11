import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Autocomplete,
  TextField,
  Box,
  Slider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  CircularProgress,
} from "@mui/material";
import { getPokemons } from "../../services/PokemonService";
import { getCounters, createCounter, updateCounter } from "../../services/CounterService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Settings() {
  const [selected, setSelected] = useState<string | null>(null);
  const [counters, setCounters] = useState<Record<string, Record<string, { value: number; id?: number }>>>({});
  const [allPokemons, setAllPokemons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Load Pokemons
  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const data = await getPokemons();
        setAllPokemons(data);
        const defaultPokemon = data.find((p: any) => p.id === 1);
        if (defaultPokemon) setSelected(defaultPokemon.name);
      } catch {
        toast.error("Error loading Pokémons");
      }
    };
    fetchPokemons();
  }, []);

  // Load counters
  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const allCounters = await getCounters();
        const structuredCounters: Record<string, Record<string, { value: number; id?: number }>> = {};
        allCounters.forEach((c: any) => {
          if (!structuredCounters[c.pokemonName]) structuredCounters[c.pokemonName] = {};
          structuredCounters[c.pokemonName][c.counterPokemonName] = { value: c.value, id: c.id };
        });
        setCounters(structuredCounters);
      } catch {
        toast.error("Error loading counters");
      }
    };
    fetchCounters();
  }, []);

  const selectedPokemon = allPokemons.find((p) => p.name === selected);
  const roleOrder = ["attacker", "all-rounder", "speedster", "defender", "supporter"];
const orderedPokemons = useMemo(() => {
  return [...allPokemons].sort(
    (a, b) => roleOrder.indexOf(a.role.toLowerCase()) - roleOrder.indexOf(b.role.toLowerCase())
  );
}, [allPokemons]);

const others = useMemo(() => {
  if (!selectedPokemon) return [];
  return allPokemons
    .filter((p) => p.name !== selectedPokemon.name)
    .sort(
      (a, b) =>
        roleOrder.indexOf(a.role.toLowerCase()) - roleOrder.indexOf(b.role.toLowerCase())
    );
}, [allPokemons, selectedPokemon]);


  // Sync counters
useEffect(() => {
  if (!selectedPokemon) return;
  setCounters((prev) => {
    const newCounters = { ...prev };
    if (!newCounters[selectedPokemon.name]) newCounters[selectedPokemon.name] = {};
    others.forEach((p) => {
      if (!newCounters[selectedPokemon.name][p.name])
        newCounters[selectedPokemon.name][p.name] = { value: 0 };
      if (!newCounters[p.name]) newCounters[p.name] = {};
      if (!newCounters[p.name][selectedPokemon.name])
        newCounters[p.name][selectedPokemon.name] = {
          value: 100 - (newCounters[selectedPokemon.name][p.name]?.value ?? 0),
        };
    });
    return newCounters;
  });
}, [selectedPokemon, others]);


  const handleChangeCounter = (pokemon: string, other: string, value: number) => {
    setCounters((prev) => {
      const newCounters = { ...prev };
      newCounters[pokemon] = { ...(newCounters[pokemon] || {}) };
      newCounters[pokemon][other] = { value, id: prev[pokemon]?.[other]?.id };
      if (!newCounters[other]) newCounters[other] = {};
      newCounters[other][pokemon] = { value: 100 - value, id: prev[other]?.[pokemon]?.id };
      return newCounters;
    });
  };

  const handleSave = async () => {
    if (!selectedPokemon) return;
    const updates = counters[selectedPokemon.name];
    if (!updates) return;

    setSaving(true);
    try {
      const newCounters = { ...counters };
      const tasks: Promise<any>[] = [];

      for (const [otherName, data] of Object.entries(updates)) {
        const counterPokemon = allPokemons.find((p) => p.name === otherName);
        if (!counterPokemon) continue;
        const payload = { pokemonId: selectedPokemon.id, counterPokemonId: counterPokemon.id, value: data.value };
        if (data.id) tasks.push(updateCounter(data.id, payload));
        else tasks.push(createCounter(payload).then((created) => { newCounters[selectedPokemon.name][otherName] = { ...data, id: created.id }; }));

        const existingInverse = counters[otherName]?.[selectedPokemon.name];
        const inversePayload = { pokemonId: counterPokemon.id, counterPokemonId: selectedPokemon.id, value: 100 - data.value };
        if (existingInverse?.id) tasks.push(updateCounter(existingInverse.id, inversePayload));
        else tasks.push(createCounter(inversePayload).then((createdInverse) => {
          if (!newCounters[otherName]) newCounters[otherName] = {};
          newCounters[otherName][selectedPokemon.name] = { value: 100 - data.value, id: createdInverse.id };
        }));
      }

      await Promise.all(tasks);
      setCounters(newCounters);
      toast.success("Counters saved successfully!");
    } catch {
      toast.error("Error saving counters");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container sx={{ py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Header + Select + Buttons */}
      <Paper sx={{ p: 2, borderRadius: 3, display: "flex", flexDirection: "column", gap: 2, backgroundColor: "rgba(249,248,248,0.95)", marginTop: 5 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center">
          Select a Pokemon to configure its counters ⚙️
        </Typography>

        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          <Autocomplete
            options={orderedPokemons.map((p) => p.name)}
            value={selected}
            onChange={(_, value) => setSelected(value)}
            renderInput={(params) => <TextField {...params} label="Select Pokémon" />}
            sx={{ flex: 1, width: "100%", minWidth: 120 }}
            size="small"
          />

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1, width: { xs: "100%", sm: "auto" } }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                if (!selectedPokemon) return;
                setCounters((prev) => {
                  const newCounters = { ...prev };
                  others.forEach((p) => {
                    newCounters[selectedPokemon.name][p.name] = { ...newCounters[selectedPokemon.name][p.name], value: 50 };
                    if (!newCounters[p.name]) newCounters[p.name] = {};
                    newCounters[p.name][selectedPokemon.name] = { ...newCounters[p.name][selectedPokemon.name], value: 50 };
                  });
                  return newCounters;
                });
                toast.info("All counters set to 50!");
              }}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Set All to 50
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Table of counters */}
      {selectedPokemon && (
        <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 3, overflowX: "auto", maxHeight: "65vh" }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
            Configure counters for {selectedPokemon.name}:
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Pokémon</TableCell>
                <TableCell align="center">Counter %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {others.map((p) => (
                <TableRow key={p.name}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <img src={p.imageUrl} alt={p.name} width={36} height={36} />
                      {p.name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} alignItems="center" gap={1}>
                     <Slider
  value={counters[selectedPokemon.name]?.[p.name]?.value ?? 0}
  onChange={(_, v) => handleChangeCounter(selectedPokemon.name, p.name, v as number)}
  min={1}
  max={100}
  valueLabelDisplay="auto"
  sx={{
    flex: 1,
    '& .MuiSlider-thumb': {
      backgroundColor: (() => {
        const val = counters[selectedPokemon.name]?.[p.name]?.value ?? 0;
        if (val < 40) return 'red';
        if (val < 60) return 'orange';
        return 'green';
      })(),
    },
    '& .MuiSlider-track': {
      backgroundColor: (() => {
        const val = counters[selectedPokemon.name]?.[p.name]?.value ?? 0;
        if (val < 40) return 'red';
        if (val < 60) return 'orange';
        return 'green';
      })(),
      border: 'none',
    },
    '& .MuiSlider-rail': {
      opacity: 0.3,
      backgroundColor: 'gray',
    },
  }}
/>

                      <Typography variant="body2" sx={{ minWidth: 40, textAlign: "center" }}>
                        {counters[selectedPokemon.name]?.[p.name]?.value ?? 0}%
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}
