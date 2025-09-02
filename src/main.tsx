import { Box } from "@mui/material";
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
        }}
      >
        <AppRouter />
        <ToastContainer position="top-right" autoClose={3000} />
      </Box>
  </StrictMode>
);
