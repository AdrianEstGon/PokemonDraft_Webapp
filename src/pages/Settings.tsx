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

export default function Settings() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [counters, setCounters] = useState<Record<string, Record<string, { value: number; id?: number }>>>({});
  const [allPokemons, setAllPokemons] = useState<any[]>([]);

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const data = await getPokemons();
        setAllPokemons(data);
      } catch (error) {
        console.error("Error loading pokemons:", error);
        toast.error("Error loading Pokémons");
      }
    };
    fetchPokemons();
  }, []);

  const selectedPokemon = allPokemons.find((p) => p.name === selected);
  const others = selectedPokemon
    ? allPokemons.filter((p) => p.name !== selectedPokemon.name)
    : [];

  useEffect(() => {
    if (!selectedPokemon) return;

    const fetchCounters = async () => {
      try {
        const allCounters = await getCounters();
        const relevantCounters = allCounters.filter(
          (c: any) => c.pokemonId === selectedPokemon.id
        );

        const newCounters: Record<string, { value: number; id?: number }> = {};
        relevantCounters.forEach((c: any) => {
          newCounters[c.counterPokemonName] = { value: c.value, id: c.id };
        });

        setCounters((prev) => ({
          ...prev,
          [selectedPokemon.name]: newCounters,
        }));
      } catch (err) {
        console.error("Error loading counters", err);
        toast.error("Error loading counters");
      }
    };

    fetchCounters();
  }, [selectedPokemon]);

  const handleChangeCounter = (pokemon: string, other: string, value: number) => {
    setCounters((prev) => ({
      ...prev,
      [pokemon]: {
        ...(prev[pokemon] || {}),
        [other]: { value, id: prev[pokemon]?.[other]?.id },
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedPokemon) return;

    const updates = counters[selectedPokemon.name];
    if (!updates) return;

    try {
      for (const [otherName, data] of Object.entries(updates)) {
        const counterPayload = {
          pokemonId: selectedPokemon.id,
          counterPokemonId: allPokemons.find((p) => p.name === otherName)?.id,
          value: data.value,
        };

        // Guardamos el counter principal
        if (data.id) {
          await updateCounter(data.id, counterPayload);
        } else {
          const created = await createCounter(counterPayload);
          setCounters((prev) => ({
            ...prev,
            [selectedPokemon.name]: {
              ...(prev[selectedPokemon.name] || {}),
              [otherName]: { value: data.value, id: created.id },
            },
          }));
        }

        // Guardamos el counter inverso automáticamente
        const inversePokemonId = selectedPokemon.id;
        const inverseCounterPokemon = allPokemons.find((p) => p.name === otherName);
        if (!inverseCounterPokemon) continue;

        const inverseValue = 100 - data.value; // valor inverso
        const existingInverse = counters[otherName]?.[selectedPokemon.name];

        const inversePayload = {
          pokemonId: inverseCounterPokemon.id,
          counterPokemonId: inversePokemonId,
          value: inverseValue,
        };

        if (existingInverse?.id) {
          await updateCounter(existingInverse.id, inversePayload);
        } else {
          const createdInverse = await createCounter(inversePayload);
          setCounters((prev) => ({
            ...prev,
            [otherName]: {
              ...(prev[otherName] || {}),
              [selectedPokemon.name]: { value: inverseValue, id: createdInverse.id },
            },
          }));
        }
      }

      toast.success("Counters saved successfully!");
    } catch (err) {
      console.error("Error saving counters", err);
      toast.error("Error saving counters");
    }
  };

  return (
    <Container
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        py: 3,
      }}
    >
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Floating back icon */}
      <Tooltip title="Return to Draft" placement="right">
        <Fab
          color="primary"
          onClick={() => navigate("/")}
          sx={{ position: "fixed", top: 24, left: 24, zIndex: 10 }}
        >
          <ArrowBackIcon />
        </Fab>
      </Tooltip>

      {/* Header + Autocomplete */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
        <Typography variant="h3" fontWeight="bold">
          Select a Pokémon to configure its counters ⚙️
        </Typography>

        <Autocomplete
          options={allPokemons.map((p) => p.name)}
          value={selected}
          onChange={(_, value) => setSelected(value)}
          renderInput={(params) => <TextField {...params} label="Select Pokémon" />}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Counters table */}
      {selectedPokemon && (
        <Paper
          sx={{
            flex: 1,
            p: 2,
            borderRadius: 3,
            boxShadow: 4,
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" fontWeight="bold" gutterBottom>
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
                      <img src={p.imageUrl} alt={p.name} style={{ width: 40, height: 40 }} />
                      {p.name}
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ width: 200 }}>
                    <Slider
                      value={counters[selectedPokemon.name]?.[p.name]?.value || 0}
                      onChange={(_, v) =>
                        handleChangeCounter(selectedPokemon.name, p.name, v as number)
                      }
                      min={1}
                      max={100}
                      valueLabelDisplay="auto"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save
            </Button>
          </Box>
        </Paper>
      )}
    </Container>
  );
}
