import { Paper, Typography, Box } from "@mui/material";

type Team = "ALLY" | "ENEMY" | null;
type Phase = "PICK" | "ASK_FIRST_PICK";

interface DraftHeaderProps {
  currentTeam: Team;
  phase: Phase;
}

export default function DraftHeader({ currentTeam, phase }: DraftHeaderProps) {
  const phaseText = phase === "PICK" ? "Pick Phase" : "Draft Setup";

  const teamText =
    currentTeam === "ALLY"
      ? "Your Team"
      : currentTeam === "ENEMY"
      ? "Enemy Team"
      : "Choose first pick";

  const gradient =
    currentTeam === "ALLY"
      ? "linear-gradient(90deg,#1e63d6,#3aa0ff)"
      : currentTeam === "ENEMY"
      ? "linear-gradient(90deg,#c1121f,#ee1c25)"
      : "linear-gradient(90deg,#3a4260,#26304a)";

  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        textAlign: "center",
        background: gradient,
        color: "white",
        border: "none",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <Typography variant="subtitle2" sx={{ opacity: 0.85, letterSpacing: 2, textTransform: "uppercase" }}>
        {phaseText}
      </Typography>
      <Typography variant="h5" fontWeight={800}>
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
          {teamText}
        </Box>
      </Typography>
    </Paper>
  );
}
