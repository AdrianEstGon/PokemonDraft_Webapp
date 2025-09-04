import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "../pages/App";
import Settings from "../pages/Settings";
import PokemonCrud from "../pages/PokemonCrud";
import Login from "../pages/Login";
import UserManagement from "../pages/UserManagement"; 
import UserBagPage from "../pages/UserBag"; // 🔹 importar la mochila
import PrivateRoute from "./PrivateRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 Página por defecto */}
        <Route path="/" element={<Login />} />

        {/* 🔹 Rutas protegidas */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <App />
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/pokemons"
          element={
            <PrivateRoute>
              <PokemonCrud />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <UserManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/bag"
          element={
            <PrivateRoute>
              {/* 🔹 Aquí pasamos el userId */}
              <UserBagPage userId={Number(localStorage.getItem("userId"))} />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
