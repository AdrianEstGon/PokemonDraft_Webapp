import { createTheme, alpha } from "@mui/material/styles";

// Dark "esports" theme for Pokémon Unite Drafter.
// Palette: deep navy surfaces, Pokéball red primary, electric-blue secondary, gold accents.

export const PALETTE = {
  bg: "#0a0e1a",
  bgElevated: "#121826",
  surface: "#161d2e",
  surfaceAlt: "#1c2438",
  border: "#26304a",
  red: "#ee1c25",
  redSoft: "#ff4d54",
  blue: "#3aa0ff",
  blueSoft: "#7ac0ff",
  gold: "#ffcb3d",
  green: "#31d07a",
  orange: "#ff9f43",
  textPrimary: "#eef2ff",
  textSecondary: "#9aa6c3",
};

// Role -> accent colour, reused across the app (chips, tier cells, borders).
export const ROLE_COLORS: Record<string, string> = {
  Attacker: "#ff5a6a",
  "All-Rounder": "#c07dff",
  Defender: "#4ad991",
  Speedster: "#48b6ff",
  Supporter: "#ffcb3d",
};

export const roleColor = (role?: string) =>
  (role && ROLE_COLORS[role]) || PALETTE.textSecondary;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: PALETTE.red, light: PALETTE.redSoft, contrastText: "#fff" },
    secondary: { main: PALETTE.blue, light: PALETTE.blueSoft, contrastText: "#04121f" },
    success: { main: PALETTE.green },
    warning: { main: PALETTE.orange },
    error: { main: PALETTE.red },
    background: { default: PALETTE.bg, paper: PALETTE.surface },
    text: { primary: PALETTE.textPrimary, secondary: PALETTE.textSecondary },
    divider: PALETTE.border,
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily:
      '"Rajdhani","Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',
    h4: { fontWeight: 800, letterSpacing: 0.5 },
    h5: { fontWeight: 800, letterSpacing: 0.5 },
    h6: { fontWeight: 700, letterSpacing: 0.4 },
    button: { fontWeight: 700, letterSpacing: 0.6 },
    subtitle2: { letterSpacing: 0.4 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: PALETTE.bg,
          color: PALETTE.textPrimary,
          scrollbarColor: `${PALETTE.border} transparent`,
        },
        "::-webkit-scrollbar": { width: 10, height: 10 },
        "::-webkit-scrollbar-thumb": {
          background: PALETTE.border,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${PALETTE.border}`,
          backgroundColor: PALETTE.surface,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12, textTransform: "none" },
        containedPrimary: {
          boxShadow: `0 6px 20px ${alpha(PALETTE.red, 0.35)}`,
          "&:hover": { boxShadow: `0 8px 26px ${alpha(PALETTE.red, 0.5)}` },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: alpha(PALETTE.bgElevated, 0.85),
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${PALETTE.border}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: PALETTE.surfaceAlt,
          border: `1px solid ${PALETTE.border}`,
          fontSize: 12,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha(PALETTE.bgElevated, 0.6),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: PALETTE.border },
      },
    },
  },
});

export default theme;
