import { Box, CssBaseline, ThemeProvider, Typography } from "@mui/material";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import AppRouter from "./router/AppRouter.tsx";
import { ToastContainer } from "react-toastify";
import theme, { PALETTE } from "./theme.ts";

// Faint Pokéball pattern etched into the dark background.
const pokeballPattern = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 140 140">
     <g stroke="#ffffff" stroke-opacity="0.05" fill="none" stroke-width="3">
       <circle cx="70" cy="70" r="46"/>
       <line x1="24" y1="70" x2="116" y2="70"/>
       <circle cx="70" cy="70" r="14"/>
     </g>
   </svg>`
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          color: PALETTE.textPrimary,
          background: `
            radial-gradient(1200px 600px at 80% -10%, ${PALETTE.blue}22, transparent 60%),
            radial-gradient(900px 500px at 0% 110%, ${PALETTE.red}22, transparent 55%),
            linear-gradient(160deg, ${PALETTE.bg} 0%, #0c1120 55%, #0a0e1a 100%)
          `,
          "&::before": {
            content: '""',
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: `url("data:image/svg+xml,${pokeballPattern}")`,
            backgroundSize: "140px 140px",
            opacity: 0.6,
          },
          "& > *": { position: "relative", zIndex: 1 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <AppRouter />
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </Box>

        {/* Footer con disclaimer */}
        <Box
          component="footer"
          sx={{
            textAlign: "center",
            py: 1,
            px: 2,
            backgroundColor: "rgba(10,14,26,0.6)",
            borderTop: `1px solid ${PALETTE.border}`,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            © 2025 Pokemon Unite Drafter. All rights reserved. <br />
            This app is a fan-made draft simulator and is not affiliated with,
            endorsed, or sponsored by Nintendo, The Pokémon Company, Game Freak, or Tencent. <br />
            Pokémon and Pokémon character names are trademarks of their respective owners
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  </StrictMode>
);
