import { Box, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

type BallType = "pokeball" | "superball" | "ultraball" | "masterball";

export default function StartPage() {
  const navigate = useNavigate();
  const [isCapturing, setIsCapturing] = useState(false);
  const [showShine, setShowShine] = useState(false);

  // 🎲 Elegir una Pokéball random
  const ballType: BallType = useMemo(() => {
    const types: BallType[] = ["pokeball", "superball", "ultraball", "masterball"];
    return types[Math.floor(Math.random() * types.length)];
  }, []);

  const handleStart = () => {
    setIsCapturing(true);
    setShowShine(true); // activa el brillo
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #a2d2ff, #bde0fe)",
      }}
    >
      <Container sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Pokéball con animación */}
        <motion.div
          animate={
            isCapturing
              ? { rotate: [0, -20, 20, -10, 10, -5, 5, 0], scale: [1, 1.1, 1] }
              : {}
          }
          transition={{ duration: 2, ease: "easeInOut" }}
          onAnimationComplete={() => {
            if (isCapturing) navigate("/draft");
          }}
          style={{
            position: "relative",
            borderRadius: "50%",
            width: "min(80vw, 380px)", // 🔥 más grande
            height: "min(80vw, 380px)", // 🔥 más grande
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.45)",
            background: "#fff",
          }}
        >
          {/* Parte superior */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "50%",
              background:
                ballType === "pokeball"
                  ? "#EE1C25"
                  : ballType === "superball"
                  ? "#2d5dd0"
                  : ballType === "ultraball"
                  ? "linear-gradient(to bottom, #333 0%, #111 100%)"
                  : "#8b2eb5",
            }}
          />

          {/* Parte inferior */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "50%",
              background: "#fff",
            }}
          />

          {/* Línea negra central */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "100%",
              height: "12%",
              background: "#000",
              transform: "translateY(-50%)",
              zIndex: 1,
            }}
          />

         {/* Superball con 2 rayas verticales */}
        {ballType === "superball" && (
          <>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: "15%",   // 🔥 Más hacia la izquierda
                width: "12%",  // un poco más delgadas
                height: "50%",
                background: "#ff0800ff",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                right: "15%",  // 🔥 Más hacia la derecha
                width: "12%",  // un poco más delgadas
                height: "50%",
                background: "#ff0800ff",
              }}
            />
          </>
        )}

          

         {/* Ultraball con 2 rayas verticales */}
{ballType === "ultraball" && (
  <>
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: "15%",   // 🔥 Más hacia la izquierda
        width: "12%",  // un poco más delgadas
        height: "50%",
        background: "#FFD700",
      }}
    />
    <Box
      sx={{
        position: "absolute",
        top: 0,
        right: "15%",  // 🔥 Más hacia la derecha
        width: "12%",  // un poco más delgadas
        height: "50%",
        background: "#FFD700",
      }}
    />
  </>
)}

          {/* Masterball detalles */}
          {ballType === "masterball" && (
            <>
              <Box
                sx={{
                  position: "absolute",
                  top: "12%",
                  left: "12%",
                  width: "25%",
                  height: "20%",
                  background: "pink",
                  borderRadius: "50%",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "12%",
                  right: "12%",
                  width: "25%",
                  height: "20%",
                  background: "pink",
                  borderRadius: "50%",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "4%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "2.5rem",
                  fontWeight: "bold",
                  color: "white",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                M
              </Box>
            </>
          )}

          {/* Brillo animado */}
          {showShine && (
            <motion.div
              initial={{ x: "-150%" }}
              animate={{ x: "150%" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "60%",
                height: "100%",
                background:
                  "linear-gradient(120deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.1) 80%)",
                transform: "skewX(-20deg)",
                zIndex: 5,
              }}
            />
          )}

          {/* Botón central */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              width: "35%",
              height: "35%",
              background: "#fff",
              border: "6px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              boxShadow: "inset 0 0 8px rgba(0,0,0,0.3)",
            }}
          >
            <Button
              onClick={handleStart}
              disabled={isCapturing}
              sx={{
                borderRadius: "50%",
                width: "85%",
                height: "85%",
                background: "#f9f9f9",
                border: "3px solid black",
                color: "#000",
                fontSize: { xs: "0.8rem", sm: "1rem" },
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            >
              Start Draft
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
