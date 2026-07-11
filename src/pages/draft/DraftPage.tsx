import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Button,
  Chip,
} from "@mui/material";
import UpdateIcon from "@mui/icons-material/Update";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import UndoIcon from "@mui/icons-material/Undo";
import DraftHeader from "./components/DraftHeader";
import DraftPicks from "./components/DraftPicks";
import DraftAvailable from "./components/DraftAvailable";
import { useDraftLogic } from "../../hooks/useDraftLogic";
import { useNavigate } from "react-router-dom";

export default function DraftPage() {
  const {
    currentTeam,
    phase,
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
    setWhoStarts,
    loading,
    undo,
    countersMeta,
  } = useDraftLogic();

  const [openFirstPickDialog, setOpenFirstPickDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setOpenFirstPickDialog(phase === "ASK_FIRST_PICK");
  }, [phase]);

  const handleRestart = () => {
    reset();
    navigate("/app");
  };

  const chooseFirstPick = (team: "ALLY" | "ENEMY") => {
    setWhoStarts(team);
    setOpenFirstPickDialog(false);
  };

  const freshness = (() => {
    if (!countersMeta?.updatedAt) return null;
    const isLive = countersMeta.source === "uniteapi.dev";
    const when = new Date(countersMeta.updatedAt);
    const label = isNaN(when.getTime())
      ? countersMeta.source
      : when.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return { isLive, label };
  })();

  return (
    <Container
      sx={{
        py: { xs: 2, sm: 3 },
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
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
          position: "relative",
          overflowY: "auto",
          maxHeight: "95vh",
          bgcolor: "rgba(18,24,38,0.85)",
          backdropFilter: "blur(10px)",
          mt: 6,
        }}
      >
        <DraftHeader currentTeam={currentTeam} phase={phase} />

        {freshness && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: -1 }}>
            <Tooltip
              title={
                freshness.isLive
                  ? "Counter data scraped daily from uniteapi.dev"
                  : "Using built-in fallback data until the daily scrape runs"
              }
            >
              <Chip
                size="small"
                icon={<UpdateIcon sx={{ fontSize: 16 }} />}
                label={
                  freshness.isLive
                    ? `Counters · uniteapi.dev · ${freshness.label}`
                    : `Counters · fallback data`
                }
                color={freshness.isLive ? "secondary" : "default"}
                variant="outlined"
              />
            </Tooltip>
          </Box>
        )}

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Picks */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                height: "100%",
                bgcolor: "#1c2438",
              }}
            >
              <DraftPicks allyPicks={allyPicks} enemyPicks={enemyPicks} />
            </Paper>
          </Grid>

          {/* Available */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                height: "100%",
                bgcolor: "#1c2438",
                overflowY: "auto",
              }}
            >
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
                loading={loading}              />
            </Paper>
          </Grid>
        </Grid>

        <Tooltip title="Undo last action">
  <Fab
    color="primary"
    onClick={undo}
    sx={{
      position: "fixed",
      bottom: { xs: 80, sm: 24 }, // para no solaparse con Restart
      left: { xs: "50%", sm: 90 },
      transform: { xs: "translateX(-50%)", sm: "none" },
      zIndex: 1000,
    }}
  >
    <UndoIcon />
  </Fab>
</Tooltip>


        {/* Restart FAB */}
        <Tooltip title="Restart draft">
          <Fab
            color="secondary"
            onClick={handleRestart}
            sx={{
              position: "fixed",
              bottom: { xs: 16, sm: 24 },
              left: { xs: "50%", sm: 24 },
              transform: { xs: "translateX(-50%)", sm: "none" },
              zIndex: 1000,
            }}
          >
            <RestartAltIcon />
          </Fab>
        </Tooltip>

        {/* Dialog: Who is first pick */}
        <Dialog
          open={openFirstPickDialog}
          onClose={() => {}}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle textAlign="center">Who is first pick?</DialogTitle>
          <DialogContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <Button
                variant="contained"
                size="large"
                sx={{ flex: 1 }}
                onClick={() => chooseFirstPick("ALLY")}
              >
                Allies
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                sx={{ flex: 1 }}
                onClick={() => chooseFirstPick("ENEMY")}
              >
                Enemies
              </Button>
            </Stack>
          </DialogContent>
        </Dialog>
      </Paper>
    </Container>
  );
}
