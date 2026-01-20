import { Routes, Route, Navigate, HashRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import PrivateLayout from "../layouts/PrivateLayout";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Productos from "../pages/Productos";
import Entradas from "../pages/Entradas";
import Salidas from "../pages/Salidas";

export default function AppRoutes() {
  return (
    <HashRouter> {/* ← Este es el ÚNICO Router */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<PrivateRoute />}>
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/entradas" element={<Entradas />} />
            <Route path="/salidas" element={<Salidas />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
