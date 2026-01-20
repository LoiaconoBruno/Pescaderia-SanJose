import { Routes, Route, Navigate } from "react-router-dom"; // ← Agregá Routes
import PrivateRoute from "./PrivateRoute";
import PrivateLayout from "../layouts/PrivateLayout";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Productos from "../pages/Productos";
import Entradas from "../pages/Entradas";
import Salidas from "../pages/Salidas";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<Login />} />

      {/* Privadas */}
      <Route element={<PrivateRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/entradas" element={<Entradas />} />
          <Route path="/salidas" element={<Salidas />} />
        </Route>
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
