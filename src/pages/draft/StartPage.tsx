import { Box, Button, Container, Stack, Typography} from "@mui/material";
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
        flexDirection: "column",
        gap: 3,
        background: "linear-gradient(135deg, #a2d2ff, #bde0fe)",
      }}
    >
      <Container
        sx={{
          backgroundColor: "#fbfbfb",
          borderRadius: "50%",
          width: { xs: 280, sm: 400, md: 500 },
          height: { xs: 280, sm: 400, md: 500 },
          p: { xs: 2, sm: 4 },
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Pokemon Unite Draft
        </Typography>
        <Typography variant="h6" gutterBottom>
          Who bans first?
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => navigate("/draft?whoStarts=ALLY")}
          >
            Allies
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={() => navigate("/draft?whoStarts=ENEMY")}
          >
            Enemies
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
