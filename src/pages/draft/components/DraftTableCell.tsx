import { TableCell, Box } from "@mui/material";

type Pokemon = {
  name: string;
  imageUrl: string;
  role: "Attacker" | "Defender" | "Supporter" | "All-Rounder" | "Speedster" | string;
};

function getClassColor(role?: string) {
  switch (role) {
    case "Attacker": return "#ffcccc";
    case "Defender": return "#ccffcc";
    case "Supporter": return "#fff2cc";
    case "All-Rounder": return "#e6ccff";
    case "Speedster": return "#cce0ff";
    default: return "#f0f0f0";
  }
}

export default function DraftTableCell({
  pokemon,
  isAlly,
  recommendation,
  showRecommendation = false, // 🔹 nuevo
}: {
  pokemon?: Pokemon;
  isAlly?: boolean;
  recommendation?: number; // 0-100
  showRecommendation?: boolean;
}) {
  const color = pokemon ? getClassColor(pokemon.role) : "transparent";

  const recColor =
    recommendation === undefined
      ? "transparent"
      : recommendation >= 60
      ? "green"
      : recommendation >= 40
      ? "orange"
      : "red";

  return (
    <TableCell
      sx={{
        bgcolor: pokemon ? color : "transparent",
        textAlign: "center",
        height: 80,
        width: 80,
        p: 0.5,
        borderRadius: 2,
        borderRight: isAlly ? "3px solid rgba(0,0,0,0.3)" : "none",
        position: "relative",
      }}
    >
      {pokemon && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", width: "100%" }}>
            <img
              src={pokemon.imageUrl}
              alt={pokemon.name}
              style={{ width: "70%", height: "70%", objectFit: "contain" }}
            />
          </Box>

          {showRecommendation && recommendation !== undefined && (
            <Box
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                fontSize: "0.65rem",
                fontWeight: "bold",
                color: "white",
                bgcolor: recColor,
                px: 0.5,
                borderRadius: 1,
              }}
            >
              {recommendation}
            </Box>
          )}
        </>
      )}
    </TableCell>
  );
}

