import { BrowserRouter, Routes, Route } from "react-router-dom";
import Settings from "../pages/admin/Settings";
import PokemonCrud from "../pages/admin/PokemonCrud";
import Login from "../pages/Login";
import UserManagement from "../pages/admin/UserManagement"; 
import UserBagPage from "../pages/UserBag"; 
import DraftPage from "../pages/draft/DraftPage";
import PrivateRoute from "./PrivateRoute";
import StartPage from "../pages/draft/StartPage";
import NavBar from "../pages/NavBar";
import SimulatorPage from "../pages/TeamSimulator"; // 👈 importa el simulador

function LayoutWithNav({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem("role");
  return (
    <>
      <NavBar role={role} />
      {children}
    </>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔹 Página pública */}
        <Route path="/" element={<Login />} />

        {/* 🔹 Rutas con navbar */}
        <Route
          path="/app"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <StartPage />
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <Settings />
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
        <Route
          path="/pokemons"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <PokemonCrud />
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <UserManagement />
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
        <Route
          path="/bag"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <UserBagPage userId={Number(localStorage.getItem("userId"))} />
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
        <Route
          path="/draft"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <DraftPage />
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
        {/* 🔹 Nuevo: Simulador */}
        <Route
          path="/simulator"
          element={
            <PrivateRoute>
              <LayoutWithNav>
                <SimulatorPage/>
              </LayoutWithNav>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
