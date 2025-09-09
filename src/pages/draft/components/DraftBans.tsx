import { Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import DraftTableCell from "./DraftTableCell";

export default function DraftBans({
  allyBans,
  enemyBans,
}: {
  allyBans: any[];
  enemyBans: any[];
}) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 4 }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">Bans</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: "primary.main", color: "white", textAlign: "center", fontWeight: "bold" }}>Allies</TableCell>
            <TableCell sx={{ bgcolor: "error.main", color: "white", textAlign: "center", fontWeight: "bold" }}>Enemies</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[0, 1, 2].map((i) => (
            <TableRow key={i}>
              <DraftTableCell pokemon={allyBans[i]} isAlly />
              <DraftTableCell pokemon={enemyBans[i]} />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
