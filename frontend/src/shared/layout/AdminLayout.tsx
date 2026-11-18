import { NavLink, Outlet } from "react-router-dom";

const SECCIONES = [
  { to: "/admin/resumen", label: "Resumen", icono: "📊" },
  { to: "/admin/pedidos", label: "Pedidos", icono: "🧾" },
  { to: "/admin/productos", label: "Productos", icono: "🥐" },
  { to: "/admin/categorias", label: "Categorías", icono: "🏷️" },
  { to: "/admin/usuarios", label: "Usuarios", icono: "👥" },
];

// Pestañas del panel de administración + contenido de la sección.
function AdminLayout() {
  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-2 rounded-3xl bg-lavanda-50 p-2 ring-1 ring-lavanda-100">
        {SECCIONES.map((s) => (
          <NavLink
            key={s.to}
            to={s.to}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold transition-colors ${
                isActive ? "bg-white text-lavanda-800 shadow-sm" : "text-lavanda-700 hover:bg-lavanda-100"
              }`
            }
          >
            <span aria-hidden="true">{s.icono}</span>
            {s.label}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}

export default AdminLayout;
