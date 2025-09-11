import { Paper, Typography } from "@mui/material";

type Team = "ALLY" | "ENEMY" | null;
type Phase = "BAN" | "PICK" | "ASK_FIRST_PICK" | "ALLY_BANS" | "ENEMY_BANS";

interface DraftHeaderProps {
  currentTeam: Team;
  phase: Phase;
}

export default function DraftHeader({ currentTeam, phase }: DraftHeaderProps) {
  // Determinar texto de fase
  let phaseText = "";
  if (phase === "BAN" || phase === "ALLY_BANS" || phase === "ENEMY_BANS" || phase === "ASK_FIRST_PICK") {
    phaseText = "Ban";
  } else if (phase === "PICK") {
    phaseText = "Pick";
  }

  // Determinar equipo
  let teamText = currentTeam === "ALLY" ? "Allies" : currentTeam === "ENEMY" ? "Enemies" : "";

  // Color del header según equipo
  let bgColor = currentTeam === "ALLY" ? "primary.main" : currentTeam === "ENEMY" ? "error.main" : "grey.500";

  return (
    <Paper sx={{ p: 2, borderRadius: 3, textAlign: "center", bgcolor: bgColor, color: "white" }}>
      <Typography variant="h6" fontWeight="bold">
        {teamText} {phaseText}
      </Typography>
    </Paper>
  );
}
