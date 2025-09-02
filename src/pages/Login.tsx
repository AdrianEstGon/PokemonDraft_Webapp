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
  const [loading, setLoading] = useState(false); // 🔹 Nuevo estado loading

  const navigate = useNavigate();

  // 🔹 Password strength validator
  const isPasswordSecure = (pwd: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pwd);
  };

  const handleAuth = async () => {
    try {
      setLoading(true); // 🔹 Activamos loading
      if (tab === 0) {
        // LOGIN
        const res = await login(username, password);
        localStorage.setItem("token", res.token);
        localStorage.setItem("role", res.role);
        toast.success("Login successful");
        navigate("/app");
      } else {
        // SIGN UP
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
      setLoading(false); // 🔹 Desactivamos loading
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #a2d2ff, #bde0fe)",
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: 350, borderRadius: 3 }}>
        <Typography variant="h5" textAlign="center" mb={2}>
          Pokemon Unite Drafter
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="Login" />
          <Tab label="Sign up" />
        </Tabs>

        {/* 🔹 Login Panel */}
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
              disabled={loading} // 🔹 Deshabilitamos botón mientras carga
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>
          </Box>
        )}

        {/* 🔹 Sign Up Panel */}
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
              disabled={loading} // 🔹 Deshabilitamos botón mientras carga
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
