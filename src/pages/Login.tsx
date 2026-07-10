import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CatchingPokemonIcon from "@mui/icons-material/CatchingPokemon";
import { login, register } from "../services/AuthService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const isPasswordSecure = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pwd);
  };

  const handleAuth = async () => {
    try {
      setLoading(true);
      if (tab === 0) {
        const res = await login(username, password);
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role);
        localStorage.setItem("userId", res.userId.toString());
        toast.success("Login successful");
        navigate("/app");
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        if (!isPasswordSecure(password)) {
          toast.error(
            "Password must be at least 8 characters, include uppercase, lowercase, a number, and a symbol"
          );
          return;
        }
        await register(username, password);
        toast.success("User registered. Please login now");
        setTab(0);
      }
    } catch (err: any) {
      if (err.response?.status === 400 && err.response.data === "User already exists") {
        toast.error("User already exists");
      } else {
        toast.error(err.response?.data || "Authentication error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          width: "100%",
          maxWidth: 380,
          borderRadius: 4,
          backgroundColor: "rgba(22,29,46,0.72)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <CatchingPokemonIcon sx={{ fontSize: 54, color: "#ee1c25", mb: 1 }} />
          <Typography
            variant="h5"
            textAlign="center"
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              background: "linear-gradient(90deg,#ff4d54,#ffcb3d)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            UNITE DRAFTER
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Draft smarter with live counter data
          </Typography>
        </Box>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="Login" />
          <Tab label="Sign up" />
        </Tabs>

        {tab === 0 && (
          <Box mt={2}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, borderRadius: 2 }}
              onClick={handleAuth}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>
          </Box>
        )}

        {tab === 1 && (
          <Box mt={2}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              label="Repeat Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="button"
              fullWidth
              variant="contained"
              sx={{ mt: 3, borderRadius: 2 }}
              onClick={handleAuth}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign up"}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LoginPage;
