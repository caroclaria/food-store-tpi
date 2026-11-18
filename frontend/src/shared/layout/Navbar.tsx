import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import Badge from "@/shared/ui/Badge";
import Button from "@/shared/ui/Button";

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  `rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${
    isActive ? "bg-rosa-100 text-rosa-800" : "text-tinta-600 hover:bg-crema-200"
  }`;

function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidad = useCartStore((s) => s.items.reduce((acc, i) => acc + i.cantidad, 0));
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-crema-200 bg-crema-50/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rosa-200 text-lg" aria-hidden="true">
            🍜
          </span>
          <span className="text-xl font-black tracking-tight text-tinta-900">
            Food<span className="text-rosa-700">Store</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Catálogo
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={linkClass}>
              Mis pedidos
            </NavLink>
          )}
          <NavLink to="/carrito" className={linkClass}>
            <span className="flex items-center gap-1.5">
              Carrito
              {cantidad > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-menta-300 px-1.5 text-xs font-black text-menta-800">
                  {cantidad}
                </span>
              )}
            </span>
          </NavLink>
          {usuario?.role === "admin" && (
            <NavLink
              to="/admin/resumen"
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-bold transition-colors ${
                  isActive ? "bg-lavanda-200 text-lavanda-800" : "text-lavanda-700 hover:bg-lavanda-100"
                }`
              }
            >
              Panel admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          {usuario ? (
            <>
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-sm font-extrabold text-tinta-800">{usuario.full_name}</p>
                <Badge color={usuario.role === "admin" ? "lavanda" : "menta"}>
                  {usuario.role === "admin" ? "Administrador" : "Cliente"}
                </Badge>
              </div>
              <Button variant="secundario" size="sm" onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-tinta-600 hover:text-tinta-900">
                Ingresar
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-rosa-300 px-4 py-2 text-sm font-bold text-tinta-900 hover:bg-rosa-400"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
