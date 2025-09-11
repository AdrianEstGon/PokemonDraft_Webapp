import { useEffect, useState } from "react";
import { getPokemons } from "../services/PokemonService";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Paper,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CasinoIcon from "@mui/icons-material/Casino";

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  role: string;
}

export default function PokemonSimulatorPage() {
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [teamAlly, setTeamAlly] = useState<(Pokemon | null)[]>(Array(5).fill(null));
  const [teamEnemy, setTeamEnemy] = useState<(Pokemon | null)[]>(Array(5).fill(null));
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  // 🔹 Cargar todos los pokémons
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const pokemons = await getPokemons();
      setAllPokemons(pokemons);
      setLoading(false);
    };
    fetchData();
  }, []);

  // 🔹 Función de randomizador con animación
  const randomizeTeams = () => {
    if (allPokemons.length < 10 || animating) return;

    setAnimating(true);

    let interval: ReturnType<typeof setInterval>;
    let counter = 0;

    interval = setInterval(() => {
      const shuffled = [...allPokemons].sort(() => Math.random() - 0.5);
      setTeamAlly(shuffled.slice(0, 5));
      setTeamEnemy(shuffled.slice(5, 10));
      counter++;
    }, 150); // cada 150ms cambia

    setTimeout(() => {
      clearInterval(interval);
      const finalShuffled = [...allPokemons].sort(() => Math.random() - 0.5);
      setTeamAlly(finalShuffled.slice(0, 5));
      setTeamEnemy(finalShuffled.slice(5, 10));
      setAnimating(false);
    }, 3000); // dura 3 segundos
  };

  const renderTeam = (team: (Pokemon | null)[], title: string, color: string) => (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        bgcolor: color,
        width: "100%",
        maxWidth: 600,
        mb: 3,
      }}
    >
      <Typography
        variant="h6"
        align="center"
        fontWeight="bold"
        sx={{ mb: 2, color: "white" }}
      >
        {title}
      </Typography>
      <Grid container spacing={2} justifyContent="center">
        {Array.from({ length: 5 }).map((_, idx) => {
          const pokemon = team[idx];
          return (
            <Grid item xs={6} sm={4} md={2.4} key={idx}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                  bgcolor: "white",
                  textAlign: "center",
                  height: 140,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  animation: animating ? "flash 0.3s linear infinite" : "none",
                }}
              >
                {pokemon ? (
                  <>
                    <CardMedia
                      component="img"
                      image={pokemon.imageUrl}
                      alt={pokemon.name}
                      sx={{ height: 80, objectFit: "contain", p: 1 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, p: 1 }}>
                      {pokemon.name}
                    </Typography>
                  </>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: "gray", fontWeight: 500 }}
                  >
                    Empty
                  </Typography>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );

  return (
    <Box
      p={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      minHeight="100vh"
      marginTop={6}
      gap={2}
    >
      <Typography
        variant="h4"
        gutterBottom
        fontWeight="bold"
        textAlign="center"
        marginTop={5}
      >
        🎲 Pokemon Unite Team Simulator 🎲
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {renderTeam(teamAlly, "Allies", "#1976d2")}
          {renderTeam(teamEnemy, "Enemies", "#d32f2f")}

          <IconButton
            color="primary"
            onClick={randomizeTeams}
            disabled={animating}
            sx={{
              mt: 2,
              bgcolor: "white",
              border: "2px solid #1976d2",
              borderRadius: "50%",
              p: 2,
              animation: animating ? "spin 0.5s linear infinite" : "none",
              "&:hover": {
                bgcolor: "#f0f0f0",
              },
            }}
          >
            <CasinoIcon fontSize="large" />
          </IconButton>
        </>
      )}

      {/* Animaciones CSS */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </Box>
  );
}
