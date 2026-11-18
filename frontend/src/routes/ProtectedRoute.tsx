import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import type { Rol } from "@/features/usuarios/types/usuario.types";
import Cargando from "@/shared/components/Cargando";

interface ProtectedRouteProps {
  /** Si se indica, el usuario debe tener uno de estos roles. */
  allowedRoles?: Rol[];
}

/**
 * - mientras checkSession confirma la sesión → indicador de carga;
 * - sin sesión → /login (recordando a dónde quería ir);
 * - con sesión pero sin el rol → /unauthorized.
 * La protección real está en el backend (401 / 403 en cada petición).
 */
function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) return <Cargando mensaje="Verificando sesión..." />;

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
