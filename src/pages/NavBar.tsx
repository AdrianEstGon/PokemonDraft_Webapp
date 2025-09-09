import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import PeopleIcon from "@mui/icons-material/People";
import BackpackIcon from "@mui/icons-material/Backpack";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import { useNavigate } from "react-router-dom";

interface NavBarProps {
  role: string | null;
}

export default function NavBar({ role }: NavBarProps) {
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    if (path === "logout") {
      localStorage.clear();
      navigate("/");
    } else {
      navigate(path);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1976d2",
        zIndex: 20,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Logo o título */}
        <Typography variant="h6" fontWeight="bold">
          Pokemon Unite Drafter
        </Typography>

        {/* Botones de navegación con tooltips */}
        <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Home">
                <IconButton color="inherit" onClick={() => handleNav("/app")}>
                  <HomeIcon />
                </IconButton>
              </Tooltip>
          {role === "admin" && (
            <>
              <Tooltip title="Settings">
                <IconButton color="inherit" onClick={() => handleNav("/settings")}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Pokémons">
                <IconButton color="inherit" onClick={() => handleNav("/pokemons")}>
                  <CatchingPokemonIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Users">
                <IconButton color="inherit" onClick={() => handleNav("/users")}>
                  <PeopleIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <Tooltip title="Bag">
            <IconButton color="inherit" onClick={() => handleNav("/bag")}>
              <BackpackIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={() => handleNav("logout")}>
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
