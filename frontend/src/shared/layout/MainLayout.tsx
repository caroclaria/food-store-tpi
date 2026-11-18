import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// Navbar + contenido de la ruta hija.
function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <footer className="border-t border-crema-200 py-6 text-center text-xs text-tinta-400">
        Food Store · TPI Programación 4
      </footer>
    </div>
  );
}

export default MainLayout;
