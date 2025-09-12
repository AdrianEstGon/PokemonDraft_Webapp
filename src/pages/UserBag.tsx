import { useEffect, useState } from "react";
import {
  getUserPokemons,
  addPokemonToUser,
  removePokemonFromUser,
} from "../services/BagService";
import { getPokemons } from "../services/PokemonService";
import {
  Grid,
  Card,
  CardMedia,
  CardActionArea,
  Button,
  Typography,
  Box,
  Paper,
  Chip,
} from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { motion } from "framer-motion";

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  role: string;
}

interface UserBagPageProps {
  userId: number;
}

const UserBagPage = ({ userId }: UserBagPageProps) => {
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [userPokemons, setUserPokemons] = useState<number[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showLoading, setShowLoading] = useState(true); // 👈 controla el mínimo de 2s
  const [saving, setSaving] = useState(false);
  const [search] = useState("");

  const roleOrder = ["Attacker", "All-Rounder", "Speedster", "Defender", "Supporter"];

  // 🔹 Función de ordenamiento por selección + rol
  const sortPokemons = (pokemons: Pokemon[], selectedIds: number[]) => {
    return [...pokemons].sort((a, b) => {
      const aSelected = selectedIds.includes(a.id) ? 0 : 1;
      const bSelected = selectedIds.includes(b.id) ? 0 : 1;
      if (aSelected !== bSelected) return aSelected - bSelected;

      const aRoleIndex = roleOrder.indexOf(a.role);
      const bRoleIndex = roleOrder.indexOf(b.role);
      return aRoleIndex - bRoleIndex;
    });
  };

  // 🔹 Color de fondo según role
  const getClassColor = (role: string) => {
    switch (role) {
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

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);

      const pokemons = await getPokemons();
      const userBag = await getUserPokemons(userId);
      const userPokemonIds = userBag.map((p: any) => p.pokemonId);

      setUserPokemons(userPokemonIds);
      setSelected(userPokemonIds);

      const sorted = sortPokemons(pokemons, userPokemonIds);
      setAllPokemons(sorted);

      setLoadingData(false);
    };

    fetchData();
  }, [userId]);

  // 🔹 Garantizar que el loading se vea mínimo 2s
  useEffect(() => {
    if (!loadingData) {
      const timer = setTimeout(() => setShowLoading(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setShowLoading(true);
    }
  }, [loadingData]);

  // 🔹 Alternar selección visual
  const togglePokemon = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // 🔹 Guardar cambios y reordenar
  const handleSave = async () => {
    setSaving(true);

    try {
      const toAdd = selected.filter((id) => !userPokemons.includes(id));
      const toRemove = userPokemons.filter((id) => !selected.includes(id));

      for (const id of toAdd) await addPokemonToUser(userId, id);
      for (const id of toRemove) await removePokemonFromUser(userId, id);

      setUserPokemons(selected);

      const sortedAfterSave = sortPokemons(allPokemons, selected);
      setAllPokemons(sortedAfterSave);

      toast.success("Pokemon's bag saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Error saving Pokemons");
    } finally {
      setSaving(false);
    }
  };

  // 🔹 Filtrar por búsqueda
  const filteredPokemons = allPokemons.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (showLoading) {
    return (
      <Box
        sx={{
          flex: 1,
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.img
          src="/pokeball.png" // ⚠️ asegúrate de poner la imagen en public/
          alt="Loading Pokémons..."
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          style={{ width: "min(50vw, 180px)", height: "auto" }}
        />
      </Box>
    );
  }

  return (
    <Box p={3} display="flex" flexDirection="column" height="100%" marginTop={6}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <Typography variant="h4" gutterBottom textAlign="center">
        My Pokemons
      </Typography>

      {/* 🔹 Indicador de cuántos Pokémon seleccionados / total */}
      <Box textAlign="center" mb={2}>
        <Chip
          label={`${selected.length} / ${allPokemons.length}`}
          color="primary"
          sx={{ fontWeight: 600, fontSize: "1rem" }}
        />
      </Box>

      <Paper
        elevation={3}
        sx={{
          overflowY: "auto",
          p: 2,
          borderRadius: 3,
          maxHeight: "65vh",
          mx: "auto",
          width: "50%",
          minWidth: 300,
        }}
      >
        <Grid container spacing={2} justifyContent="center">
          {filteredPokemons.map((pokemon) => {
            const isSelected = selected.includes(pokemon.id);
            return (
              <Grid item xs={12} sm={6} md={2.4} key={pokemon.id}>
                <Card
                  sx={{
                    opacity: isSelected ? 1 : 0.4,
                    border: isSelected ? "2px solid #1976d2" : "1px solid #ccc",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                      cursor: "pointer",
                    },
                    bgcolor: getClassColor(pokemon.role),
                  }}
                >
                  <CardActionArea onClick={() => togglePokemon(pokemon.id)}>
                    <CardMedia
                      component="img"
                      image={pokemon.imageUrl}
                      alt={pokemon.name}
                      sx={{ height: 140, objectFit: "contain" }}
                    />
                    <Typography
                      variant="body2"
                      align="center"
                      sx={{ p: 1, fontWeight: 600 }}
                    >
                      {pokemon.name}
                    </Typography>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Box mt={3} textAlign="center">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
          sx={{
            px: 4,
            py: 1.2,
            fontSize: "1rem",
            borderRadius: 3,
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {saving ? "Saving..." : "💾 Save"}
        </Button>
      </Box>
    </Box>
  );
};

export default UserBagPage;
