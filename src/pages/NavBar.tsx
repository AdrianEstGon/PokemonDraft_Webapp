import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import PeopleIcon from "@mui/icons-material/People";
import BackpackIcon from "@mui/icons-material/Backpack";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import CasinoIcon from "@mui/icons-material/Casino"; // 🎲 simulador
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface NavBarProps {
  role: string | null;
}

export default function NavBar({ role }: NavBarProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleNav = (path: string) => {
    if (path === "logout") {
      localStorage.clear();
      navigate("/");
    } else {
      navigate(path);
    }
    setAnchorEl(null); // cerrar menú si estaba abierto
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Botones admin
  const adminItems = role === "admin"
    ? [
        { title: "Settings", icon: <SettingsIcon />, path: "/settings" },
        { title: "Pokemons", icon: <CatchingPokemonIcon />, path: "/pokemons" },
        { title: "Users", icon: <PeopleIcon />, path: "/users" },
      ]
    : [];

  // Botones usuarios normales / comunes
  const userItems = [
    { title: "Home", icon: <HomeIcon />, path: "/app" },
    { title: "Simulator", icon: <CasinoIcon />, path: "/simulator" },
    { title: "Bag", icon: <BackpackIcon />, path: "/bag" },
  ];

  const logoutItem = { title: "Logout", icon: <LogoutIcon />, path: "logout" };

  return (
    <AppBar position="fixed" sx={{ zIndex: 20 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Título */}
        <Typography variant="h6" fontWeight="bold">
          Pokemon Unite Drafter
        </Typography>

        {isSmallScreen ? (
          <>
            <IconButton color="inherit" onClick={handleMenuOpen}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
            >
              {[...userItems, ...adminItems, logoutItem].map((item) => (
                <MenuItem key={item.title} onClick={() => handleNav(item.path)}>
                  {item.icon}
                  <Typography sx={{ ml: 1 }}>{item.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: "flex", flex: 1, alignItems: "center" }}>
            {/* Centrados */}
            <Box sx={{ display: "flex", gap: 1, flex: 1, justifyContent: "center" }}>
              {userItems.map((item) => (
                <Tooltip key={item.title} title={item.title}>
                  <IconButton color="inherit" onClick={() => handleNav(item.path)}>
                    {item.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>

            {/* Admin a la derecha */}
            <Box sx={{ display: "flex", gap: 1, mr: 1 }}>
              {adminItems.map((item) => (
                <Tooltip key={item.title} title={item.title}>
                  <IconButton color="inherit" onClick={() => handleNav(item.path)}>
                    {item.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>

            {/* Logout */}
            <Box>
              <Tooltip title={logoutItem.title}>
                <IconButton color="inherit" onClick={() => handleNav(logoutItem.path)}>
                  {logoutItem.icon}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
