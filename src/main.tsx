import { Box, Typography } from "@mui/material";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import AppRouter from "./router/AppRouter.tsx";
import { ToastContainer } from "react-toastify";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #a2d2ff, #bde0fe)",
        overflow: "hidden", // 🚫 evita scroll
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Contenido principal */}
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <AppRouter />
        <ToastContainer position="top-right" autoClose={3000} />
      </Box>

      {/* Footer con disclaimer */}
      <Box
        component="footer"
        sx={{
          textAlign: "center",
          py: 1,
          px: 2,
          backgroundColor: "rgba(255,255,255,0.6)",
          fontSize: "0.75rem",
          borderTop: "1px solid rgba(0,0,0,0.1)",
        }}
      >
        <Typography variant="caption" color="textSecondary">
          © 2025 Pokemon Unite Drafter. All rights reserved. <br />
          This app is a fan-made draft simulator and is not affiliated with,
          endorsed, or sponsored by Nintendo, The Pokémon Company, Game Freak, or Tencent. <br />
          Pokémon and Pokémon character names are trademarks of their respective owners.
        </Typography>
      </Box>
    </Box>
  </StrictMode>
);
