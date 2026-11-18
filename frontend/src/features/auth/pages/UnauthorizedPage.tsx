import { Link } from "react-router-dom";
import EstadoVacio from "@/shared/components/EstadoVacio";

// Destino de ProtectedRoute cuando hay sesión pero el rol no está permitido.
function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-lg py-10">
      <EstadoVacio
        icono="🔒"
        titulo="No tenés permiso para ver esta página"
        descripcion="Esta sección es solo para administradores."
        accion={
          <Link to="/" className="rounded-xl bg-rosa-300 px-4 py-2 text-sm font-bold text-tinta-900 hover:bg-rosa-400">
            Volver al inicio
          </Link>
        }
      />
    </div>
  );
}

export default UnauthorizedPage;
