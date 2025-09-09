import { Paper, Typography } from "@mui/material";

export default function DraftHeader({ currentTeam, phase }: { currentTeam: string | null; phase: string }) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3, textAlign: "center", bgcolor: currentTeam === "ALLY" ? "primary.main" : "error.main", color: "white" }}>
      <Typography variant="h6" fontWeight="bold">
        {currentTeam === "ALLY" ? "Allies" : "Enemies"} {phase === "BAN" ? "Ban" : "Pick"}
      </Typography>
    </Paper>
  );
}
