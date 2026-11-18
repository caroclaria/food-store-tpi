import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthCardProps {
  titulo: string;
  subtitulo: string;
  children: ReactNode;
  pie?: ReactNode;
}

// Contenedor de las pantallas públicas de login y registro.
function AuthCard({ titulo, subtitulo, children, pie }: AuthCardProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Manchas de color de fondo */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rosa-200/60 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-menta-200/60 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-1/3 top-10 h-48 w-48 rounded-full bg-lavanda-200/50 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rosa-200 text-2xl" aria-hidden="true">
            🍜
          </span>
          <span className="text-2xl font-black tracking-tight text-tinta-900">
            Food<span className="text-rosa-700">Store</span>
          </span>
        </Link>
        <div className="rounded-[2rem] border border-crema-200 bg-white/90 p-7 shadow-lg shadow-crema-300/40 backdrop-blur sm:p-9">
          <h1 className="text-2xl font-black text-tinta-900">{titulo}</h1>
          <p className="mt-1 text-sm text-tinta-500">{subtitulo}</p>
          <div className="mt-7">{children}</div>
        </div>
        {pie && <div className="mt-5 text-center text-sm text-tinta-600">{pie}</div>}
      </div>
    </main>
  );
}

export default AuthCard;
