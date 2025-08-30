import { Box } from "@mui/material";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import AppRouter from "./router/AppRouter.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Box
      sx={{
        height: '100vh',        // Ocupa toda la altura de la pantalla
        width: '100vw',         // Ocupa todo el ancho
        display: 'flex',
        justifyContent: 'center', // Centrado horizontal
        alignItems: 'center',     // Centrado vertical
        backgroundImage: `url("/public/background.jpg")`, // Ruta de la imagen de fondo
        backgroundSize: "cover",        // La imagen cubre todo
        backgroundPosition: "center",   // Centrada
        backgroundRepeat: "no-repeat",  // No se repite
        overflow: "auto",
      }}
    >
      <AppRouter /> {/* 👈 aquí va el router */}
    </Box>
  </StrictMode>,
)
