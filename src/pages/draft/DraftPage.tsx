import { Container, Grid, Paper, Tooltip, Fab } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DraftHeader from "./components/DraftHeader";
import DraftBans from "./components/DraftBans";
import DraftPicks from "./components/DraftPicks";
import DraftAvailable from "./components/DraftAvailable";
import { useDraftLogic } from "../../hooks/useDraftLogic";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function DraftPage() {
  const [searchParams] = useSearchParams();
  const whoStartsParam = searchParams.get("whoStarts") as "ALLY" | "ENEMY" | null;

  // 🔹 Inicializamos el hook con el query param para evitar null
  const {
    currentTeam,
    phase,
    allyBans,
    enemyBans,
    allyPicks,
    enemyPicks,
    sortedAvailable,
    recommendations,
    reset,
    handleSelect,
    classFilter,
    setClassFilter,
    searchText,
    setSearchText,
    onlyMyPokemons,
    setOnlyMyPokemons,
  } = useDraftLogic(whoStartsParam ?? undefined);

  const navigate = useNavigate();

  const handleRestart = () => {
    reset();           // Resetea el draft
    navigate("/app");  // Redirige a /app
  };

  return (
    <Container
      sx={{
        py: 2,
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 1200,
          p: 2,
          borderRadius: 3,
          boxShadow: 6,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "relative",
        }}
      >
        <DraftHeader currentTeam={currentTeam} phase={phase} />

        <Grid container spacing={2}>
          {/* Bans */}
          <Grid item xs={12} sm={6} md={3}>
            <DraftBans allyBans={allyBans} enemyBans={enemyBans} />
          </Grid>

          {/* Picks */}
          <Grid item xs={12} sm={6} md={3}>
  <DraftPicks
    allyPicks={allyPicks}
    enemyPicks={enemyPicks}
    // ❌ no pasamos recommendations aquí
  />
</Grid>

          {/* Available */}
          <Grid item xs={12} md={6}>
            <DraftAvailable
              available={sortedAvailable}
              recommendations={recommendations}
              phase={phase}
              currentTeam={currentTeam}
              onSelect={handleSelect}
              classFilter={classFilter}
              setClassFilter={setClassFilter}
              searchText={searchText}
              setSearchText={setSearchText}
              onlyMyPokemons={onlyMyPokemons}
              setOnlyMyPokemons={setOnlyMyPokemons}
            />
          </Grid>
        </Grid>

        {/* Restart FAB */}
        <Tooltip title="Restart draft">
      <Fab
        color="secondary"
        onClick={handleRestart}
        sx={{ position: "absolute", bottom: 24, left: 24 }}
      >
        <RestartAltIcon />
      </Fab>
    </Tooltip>
      </Paper>
    </Container>
  );
}
