import { useState, useEffect } from "react";
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
  Fab,
  Tooltip,
  Paper,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { getPokemons } from "../services/PokemonService";
import { getCounters, createCounter, updateCounter } from "../services/CounterService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CircularProgress } from "@mui/material";


export default function Settings() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [counters, setCounters] = useState<Record<string, Record<string, { value: number; id?: number }>>>({});
  const [allPokemons, setAllPokemons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

// Cargar pokemons
useEffect(() => {
  const fetchPokemons = async () => {
    try {
      const data = await getPokemons();
      setAllPokemons(data);

      // Seleccionar Pikachu automáticamente
      const defaultPokemon = data.find((p: any) => p.id === 1);
      if (defaultPokemon) setSelected(defaultPokemon.name);
    } catch (error) {
      console.error("Error loading pokemons:", error);
      toast.error("Error loading Pokémons");
    }
  };
  fetchPokemons();
}, []);

  // Cargar todos los counters al inicio
  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const allCounters = await getCounters();
        const structuredCounters: Record<string, Record<string, { value: number; id?: number }>> = {};

        allCounters.forEach((c: any) => {
          const pokeName = c.pokemonName;
          const counterName = c.counterPokemonName;
          if (!structuredCounters[pokeName]) structuredCounters[pokeName] = {};
          structuredCounters[pokeName][counterName] = { value: c.value, id: c.id };
        });

        setCounters(structuredCounters);
      } catch (err) {
        console.error("Error loading counters", err);
        toast.error("Error loading counters");
      }
    };
    fetchCounters();
  }, []);



  const selectedPokemon = allPokemons.find((p) => p.name === selected);
  const roleOrder = ["attacker", "all-rounder", "speedster", "defender", "supporter"];

const others = selectedPokemon
  ? allPokemons
      .filter((p) => p.name !== selectedPokemon.name)
      .sort((a, b) => roleOrder.indexOf(a.role.toLowerCase()) - roleOrder.indexOf(b.role.toLowerCase()))
  : [];

  const orderedPokemons = [...allPokemons].sort(
  (a, b) =>
    roleOrder.indexOf(a.role.toLowerCase()) -
    roleOrder.indexOf(b.role.toLowerCase())
);

  // Sincronizar counters cuando cambia el Pokémon seleccionado
  useEffect(() => {
    if (!selectedPokemon) return;

    setCounters((prev) => {
      const newCounters = { ...prev };
      let changed = false;

      if (!newCounters[selectedPokemon.name]) {
        newCounters[selectedPokemon.name] = {};
        changed = true;
      }

      others.forEach((p) => {
        if (!newCounters[selectedPokemon.name][p.name]) {
          newCounters[selectedPokemon.name][p.name] = { value: 0 };
          changed = true;
        }

        if (!newCounters[p.name]) newCounters[p.name] = {};
        if (!newCounters[p.name][selectedPokemon.name]) {
          newCounters[p.name][selectedPokemon.name] = { value: 100 - (newCounters[selectedPokemon.name][p.name]?.value ?? 0) };
          changed = true;
        }
      });

      return changed ? newCounters : prev;
    });
  }, [selectedPokemon, others]);

  const handleChangeCounter = (pokemon: string, other: string, value: number) => {
    setCounters((prev) => {
      const newCounters = { ...prev };
      newCounters[pokemon] = { ...(newCounters[pokemon] || {}) };
      newCounters[pokemon][other] = { value, id: prev[pokemon]?.[other]?.id };

      // Mantener inverso actualizado en tiempo real
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

      const counterPayload = {
        pokemonId: selectedPokemon.id,
        counterPokemonId: counterPokemon.id,
        value: data.value,
      };

      if (data.id) {
        tasks.push(
          updateCounter(data.id, counterPayload).then(() => {
            // nada más, ya está actualizado
          })
        );
      } else {
        tasks.push(
          createCounter(counterPayload).then((created) => {
            newCounters[selectedPokemon.name][otherName] = { ...data, id: created.id };
          })
        );
      }

      // inverso
      const existingInverse = counters[otherName]?.[selectedPokemon.name];
      const inversePayload = {
        pokemonId: counterPokemon.id,
        counterPokemonId: selectedPokemon.id,
        value: 100 - data.value,
      };

      if (existingInverse?.id) {
        tasks.push(updateCounter(existingInverse.id, inversePayload));
      } else {
        tasks.push(
          createCounter(inversePayload).then((createdInverse) => {
            if (!newCounters[otherName]) newCounters[otherName] = {};
            newCounters[otherName][selectedPokemon.name] = { value: 100 - data.value, id: createdInverse.id };
          })
        );
      }
    }

    // 👈 correr todas las requests en paralelo
    await Promise.all(tasks);

    setCounters(newCounters);
    toast.success("Counters saved successfully!");
  } catch (err) {
    console.error("Error saving counters", err);
    toast.error("Error saving counters");
  } finally {
    setSaving(false);
  }
};





  return (
    <Container sx={{ height: "100vh", display: "flex", flexDirection: "column", gap: 3, py: 3 }}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Tooltip title="Return to Draft" placement="right">
        <Fab color="primary" onClick={() => navigate("/")} sx={{ position: "fixed", top: 24, left: 24, zIndex: 10, bgcolor: "black" }}>
          <ArrowBackIcon />
        </Fab>
      </Tooltip>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0, backgroundColor: "rgba(249, 248, 248, 0.8)", borderRadius: 2,
          padding: 4, }}>
        <Typography variant="h3" fontWeight="bold">
          Select a Pokémon to configure its counters ⚙️
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, alignItems: "center", width: "100%" }}>
          <Autocomplete
  options={orderedPokemons.map((p) => p.name)}
  value={selected}
  onChange={(_, value) => setSelected(value)}
  renderInput={(params) => <TextField {...params} label="Select Pokémon" />}
  sx={{ flex: 1 }}
/>


          <Box sx={{ display: "flex", gap: 2 }}>
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
            >
              Set All to 50
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {saving ? "Saving..." : "Save"}
            </Button>

          </Box>
        </Box>
      </Box>

      {selectedPokemon && (
        <Paper sx={{ flex: 1, p: 2, borderRadius: 3, boxShadow: 4, overflowY: "auto" }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Configure counters for {selectedPokemon.name}:
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Pokémon</TableCell>
                <TableCell align="left">Counter %</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {others.map((p) => (
                <TableRow key={p.name}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40 }} />
                      {p.name}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 300 }}>
  <Box display="flex" alignItems="center" gap={2}>
    <Slider
      value={counters[selectedPokemon.name]?.[p.name]?.value ?? 0}
      onChange={(_, v) => handleChangeCounter(selectedPokemon.name, p.name, v as number)}
      min={1}
      max={100}
      valueLabelDisplay="auto"
      sx={{
        flex: 1,
        '& .MuiSlider-thumb': {
          backgroundColor: () => {
            const val = counters[selectedPokemon.name]?.[p.name]?.value ?? 0;
            if (val < 40) return 'red';
            if (val < 60) return 'orange';
            return 'green';
          },
        },
        '& .MuiSlider-track': {
          backgroundColor: () => {
            const val = counters[selectedPokemon.name]?.[p.name]?.value ?? 0;
            if (val < 40) return 'red';
            if (val < 60) return 'orange';
            return 'green';
          },
          border: 'none',
        },
        '& .MuiSlider-rail': {
          opacity: 0.3,
          backgroundColor: 'gray',
        },
      }}
    />

    {/* porcentaje */}
    <Typography variant="body1" sx={{ minWidth: 40, textAlign: "center" }}>
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
