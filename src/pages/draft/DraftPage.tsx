import { useEffect, useState } from "react";
import {
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
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DraftHeader from "./components/DraftHeader";
import DraftBans from "./components/DraftBans";
import DraftPicks from "./components/DraftPicks";
import DraftAvailable from "./components/DraftAvailable";
import { useDraftLogic } from "../../hooks/useDraftLogic";
import { useNavigate } from "react-router-dom";

export default function DraftPage() {
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
    setWhoStarts,
    loading,
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
          borderRadius: 3,
          boxShadow: 6,
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
          position: "relative",
          overflowY: "auto",
          maxHeight: "95vh",
          bgcolor: "#fdfdfd",
        }}
      >
        <DraftHeader currentTeam={currentTeam} phase={phase} />

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Bans */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                height: "100%",
                boxShadow: 3,
                bgcolor: "#fff",
              }}
            >
              <DraftBans allyBans={allyBans} enemyBans={enemyBans} />
            </Paper>
          </Grid>

          {/* Picks */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                height: "100%",
                boxShadow: 3,
                bgcolor: "#fff",
              }}
            >
              <DraftPicks allyPicks={allyPicks} enemyPicks={enemyPicks} />
            </Paper>
          </Grid>

          {/* Available */}
          <Grid item xs={12} sm={12} md={6}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                height: "100%",
                boxShadow: 3,
                bgcolor: "#fff",
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
