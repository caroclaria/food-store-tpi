import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primario" | "secundario" | "menta" | "lavanda" | "durazno" | "peligro" | "fantasma";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  cargando?: boolean;
}

const VARIANTES: Record<ButtonVariant, string> = {
  primario: "bg-rosa-300 text-tinta-900 hover:bg-rosa-400 shadow-sm shadow-rosa-200",
  secundario: "bg-white text-tinta-700 ring-1 ring-crema-300 hover:bg-crema-50",
  menta: "bg-menta-200 text-menta-800 hover:bg-menta-300",
  lavanda: "bg-lavanda-200 text-lavanda-800 hover:bg-lavanda-300",
  durazno: "bg-durazno-200 text-durazno-800 hover:bg-durazno-300",
  peligro: "bg-rosa-100 text-rosa-800 hover:bg-rosa-200",
  fantasma: "text-tinta-600 hover:bg-crema-200",
};

const TAMANOS: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-5 py-3 text-base rounded-2xl",
};

function Button({
  variant = "primario",
  size = "md",
  cargando = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTES[variant]} ${TAMANOS[size]} ${className}`}
      {...props}
    >
      {cargando && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export default Button;
