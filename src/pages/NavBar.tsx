import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import PeopleIcon from "@mui/icons-material/People";
import BackpackIcon from "@mui/icons-material/Backpack";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import CasinoIcon from "@mui/icons-material/Casino";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { PALETTE } from "../theme";

interface NavBarProps {
  role: string | null;
}

export default function NavBar({ role }: NavBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleNav = (path: string) => {
    if (path === "logout") {
      localStorage.clear();
      navigate("/");
    } else {
      navigate(path);
    }
    setAnchorEl(null);
  };

  const adminItems =
    role === "admin"
      ? [
          { title: "Pokemons", icon: <CatchingPokemonIcon />, path: "/pokemons" },
          { title: "Users", icon: <PeopleIcon />, path: "/users" },
          { title: "Tier List", icon: <LeaderboardIcon />, path: "/tierlist" },
        ]
      : [];

  const userItems = [
    { title: "Home", icon: <HomeIcon />, path: "/app" },
    { title: "Simulator", icon: <CasinoIcon />, path: "/simulator" },
    { title: "Bag", icon: <BackpackIcon />, path: "/bag" },
  ];

  const logoutItem = { title: "Logout", icon: <LogoutIcon />, path: "logout" };
  const allItems = [...userItems, ...adminItems];

  const isActive = (path: string) => location.pathname === path;

  const NavButton = ({ item }: { item: (typeof userItems)[number] }) => (
    <Tooltip key={item.title} title={item.title}>
      <Button
        onClick={() => handleNav(item.path)}
        startIcon={item.icon}
        sx={{
          color: isActive(item.path) ? "#fff" : PALETTE.textSecondary,
          px: 1.5,
          borderRadius: 2,
          fontWeight: 600,
          bgcolor: isActive(item.path) ? "rgba(255,255,255,0.08)" : "transparent",
          "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" },
        }}
      >
        {item.title}
      </Button>
    </Tooltip>
  );

  return (
    <AppBar position="fixed" sx={{ zIndex: 1200 }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        {/* Brand */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
          onClick={() => handleNav("/app")}
        >
          <CatchingPokemonIcon sx={{ color: PALETTE.red, fontSize: 30 }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              background: `linear-gradient(90deg, ${PALETTE.redSoft}, ${PALETTE.gold})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: { xs: "none", sm: "block" },
            }}
          >
            UNITE DRAFTER
          </Typography>
        </Box>

        {isSmallScreen ? (
          <>
            <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
              {[...allItems, logoutItem].map((item) => (
                <MenuItem
                  key={item.title}
                  selected={isActive(item.path)}
                  onClick={() => handleNav(item.path)}
                >
                  {item.icon}
                  <Typography sx={{ ml: 1.5 }}>{item.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {userItems.map((item) => (
              <NavButton key={item.title} item={item} />
            ))}
            {adminItems.length > 0 && (
              <Box
                sx={{
                  mx: 0.5,
                  width: "1px",
                  height: 24,
                  bgcolor: PALETTE.border,
                }}
              />
            )}
            {adminItems.map((item) => (
              <NavButton key={item.title} item={item} />
            ))}
            <Tooltip title="Logout">
              <IconButton
                onClick={() => handleNav("logout")}
                sx={{ ml: 0.5, color: PALETTE.textSecondary, "&:hover": { color: PALETTE.redSoft } }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
