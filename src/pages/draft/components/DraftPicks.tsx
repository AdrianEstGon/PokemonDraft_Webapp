import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import DraftTableCell from "./DraftTableCell";

export default function DraftPicks({
  allyPicks,
  enemyPicks,
}: {
  allyPicks: any[];
  enemyPicks: any[];
}) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 4 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">Draft Picks</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", fontWeight: "bold" }}>Allies</TableCell>
            <TableCell sx={{ bgcolor: "error.main", color: "white", textAlign: "center", fontWeight: "bold" }}>Enemies</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <DraftTableCell pokemon={allyPicks[i]} isAlly />
              <DraftTableCell pokemon={enemyPicks[i]} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
