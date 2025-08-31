import { Box } from "@mui/material";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import AppRouter from "./router/AppRouter.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Box
        sx={{
          height: "100vh",
          width: "100vw",
          backgroundColor: "#66b6f8", // azul claro uniforme
          overflow: "hidden", // 🚫 evita scroll
        }}
      >
        <AppRouter />
      </Box>
  </StrictMode>
);
