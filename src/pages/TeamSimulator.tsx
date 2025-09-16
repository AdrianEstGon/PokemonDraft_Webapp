import { useEffect, useState } from "react";
import { getPokemons } from "../services/PokemonService";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Paper,
  IconButton,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import CasinoIcon from "@mui/icons-material/Casino";

interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  role: string;
  tier?: string;
}

export default function PokemonSimulatorPage() {
  const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
  const [teamAlly, setTeamAlly] = useState<(Pokemon | null)[]>(Array(5).fill(null));
  const [teamEnemy, setTeamEnemy] = useState<(Pokemon | null)[]>(Array(5).fill(null));
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const pokemons = await getPokemons();
      setAllPokemons(pokemons);
      setLoading(false);
    };
    fetchData();
  }, []);

  const randomizeTeams = () => {
    if (allPokemons.length < 10 || animating) return;

    setAnimating(true);
    let interval: ReturnType<typeof setInterval>;

    interval = setInterval(() => {
      const shuffled = [...allPokemons].sort(() => Math.random() - 0.5);
      setTeamAlly(shuffled.slice(0, 5));
      setTeamEnemy(shuffled.slice(5, 10));
    }, 150);

    setTimeout(() => {
      clearInterval(interval);
      const finalShuffled = [...allPokemons].sort(() => Math.random() - 0.5);
      setTeamAlly(finalShuffled.slice(0, 5));
      setTeamEnemy(finalShuffled.slice(5, 10));
      setAnimating(false);
    }, 3000);
  };

  const renderTeam = (team: (Pokemon | null)[], title: string, color: string) => {
    const cardWidth = isMobile ? 60 : isTablet ? 100 : 120;
    const totalWidth = cardWidth * 5 + 4 * 8; // 5 cards + gaps (gap:1=8px)

    return (
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: color,
          mb: 3,
          width: "fit-content",
          maxWidth: "95%",
          mx: "auto", // centrar en pantalla grande
        }}
      >
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          align="center"
          fontWeight="bold"
          sx={{ mb: 1.5, color: "white" }}
        >
          {title}
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: isMobile ? "auto" : "visible",
            justifyContent: "center",
            p: isMobile ? "0 4px" : 0,
            width: totalWidth,
          }}
        >
          {team.map((pokemon, idx) => (
            <Card
              key={idx}
              sx={{
                borderRadius: 2,
                boxShadow: 2,
                bgcolor: "white",
                textAlign: "center",
                minWidth: cardWidth,
                height: isMobile ? 100 : isTablet ? 130 : 150,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                flexShrink: 0,
                animation: animating ? "flash 0.3s linear infinite" : "none",
              }}
            >
              {pokemon ? (
                <>
                  <CardMedia
                    component="img"
                    image={pokemon.imageUrl}
                    alt={pokemon.name}
                    sx={{
                      height: isMobile ? 40 : isTablet ? 60 : 80,
                      objectFit: "contain",
                      p: 0.5,
                      m: "0 auto",
                    }}
                  />
                  <Typography
                    variant={isMobile ? "caption" : "body2"}
                    sx={{ fontWeight: 600 }}
                    noWrap
                  >
                    {pokemon.name}
                  </Typography>
                </>
              ) : (
                <Typography
                  variant="caption"
                  sx={{ color: "gray", fontWeight: 500 }}
                >
                  Empty
                </Typography>
              )}
            </Card>
          ))}
        </Box>
      </Paper>
    );
  };

  return (
    <Box
      p={{ xs: 2, sm: 3 }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      minHeight="100vh"
      gap={2}
    >
      <Typography
        variant={isMobile ? "h6" : "h4"}
        gutterBottom
        fontWeight="bold"
        textAlign="center"
        mb={3}
        mt={10}
      >
        🎲 Pokemon Unite Team Simulator 🎲
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {renderTeam(teamAlly, "Allies", "#1976d2")}
          {renderTeam(teamEnemy, "Enemies", "#d32f2f")}

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              mb: 2,
            }}
          >
            <IconButton
              color="primary"
              onClick={randomizeTeams}
              disabled={animating}
              sx={{
                bgcolor: "white",
                border: `2px solid #1976d2`,
                borderRadius: "50%",
                p: isMobile ? 1.2 : 2,
                animation: animating ? "spin 0.5s linear infinite" : "none",
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
            >
              <CasinoIcon fontSize={isMobile ? "medium" : "large"} />
            </IconButton>
          </Box>
        </>
      )}

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
