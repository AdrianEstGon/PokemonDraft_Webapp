import { TableCell, Box } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { roleColor } from "../../../theme";

type Pokemon = {
  name: string;
  imageUrl: string;
  role: "Attacker" | "Defender" | "Supporter" | "All-Rounder" | "Speedster" | string;
  tier?: string;
};

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
  const rc = roleColor(pokemon?.role);
  const color = pokemon ? alpha(rc, 0.18) : "transparent";

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
        bgcolor: pokemon ? color : "rgba(255,255,255,0.02)",
        textAlign: "center",
        height: 80,
        width: 80,
        p: 0.5,
        borderRadius: 2,
        border: pokemon ? `1px solid ${alpha(rc, 0.5)}` : "1px solid rgba(255,255,255,0.05)",
        boxShadow: pokemon ? `inset 3px 0 0 ${rc}` : "none",
        borderRight: isAlly ? "2px solid rgba(255,255,255,0.12)" : undefined,
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

