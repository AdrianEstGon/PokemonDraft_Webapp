import { Box, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function StartPage() {
  const navigate = useNavigate();

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
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Pokeball */}
        <Box
          sx={{
            position: "relative",
            borderRadius: "50%",
            width: { xs: 250, sm: 350, md: 450 },
            height: { xs: 250, sm: 350, md: 450 },
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          }}
        >
          {/* Top half red */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "50%",
              backgroundColor: "#EE1C25",
            }}
          />
          {/* Bottom half white */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "50%",
              backgroundColor: "#FFFFFF",
            }}
          />
          {/* Black center line */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: "100%",
              height: "8%",
              backgroundColor: "#000",
              transform: "translateY(-50%)",
            }}
          />
          {/* Inner circle with button */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              width: { xs: 90, sm: 110, md: 140 },
              height: { xs: 90, sm: 110, md: 140 },
              backgroundColor: "#fff",
              border: "8px solid black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Button
              onClick={() => navigate("/draft")}
              sx={{
                borderRadius: "50%",
                width: "90%",
                height: "90%",
                backgroundColor: "#fff",
                border: "3px solid black",
                color: "#000",
                fontSize: { xs: "0.75rem", sm: "0.9rem" },
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              Start Draft
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
