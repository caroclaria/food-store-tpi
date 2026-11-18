// Validadores de campo para TanStack Form: devuelven el mensaje de error o
// undefined si el valor es válido. Replican las reglas de los schemas del backend.

type Validador<T> = (value: T) => string | undefined;

export function textoRequerido(min: number, max: number): Validador<string> {
  return (value) => {
    const limpio = value.trim();
    if (limpio.length === 0) return "Este campo es obligatorio";
    if (limpio.length < min) return `Tiene que tener al menos ${min} caracteres`;
    if (limpio.length > max) return `No puede superar los ${max} caracteres`;
    return undefined;
  };
}

export function textoOpcional(max: number): Validador<string> {
  return (value) => (value.trim().length > max ? `No puede superar los ${max} caracteres` : undefined);
}

export const validarUsername: Validador<string> = (value) => {
  const base = textoRequerido(3, 50)(value);
  if (base) return base;
  if (!/^[A-Za-z0-9_.-]+$/.test(value.trim())) return "Solo letras, números y . _ -";
  return undefined;
};

export const validarEmail: Validador<string> = (value) => {
  const limpio = value.trim();
  if (limpio.length === 0) return "El email es obligatorio";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) return "Ingresá un email válido";
  return undefined;
};

export const validarPassword: Validador<string> = (value) => {
  if (value.length === 0) return "La contraseña es obligatoria";
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (value.length > 72) return "La contraseña no puede superar los 72 caracteres";
  return undefined;
};

export function numeroMinimo(min: number, entero = false): Validador<number> {
  return (value) => {
    if (Number.isNaN(value)) return "Este campo es obligatorio";
    if (entero && !Number.isInteger(value)) return "Tiene que ser un número entero";
    if (value < min) return `Tiene que ser mayor o igual a ${min}`;
    return undefined;
  };
}

export const validarUrlOpcional: Validador<string> = (value) => {
  const limpio = value.trim();
  if (limpio.length === 0) return undefined;
  if (limpio.length > 500) return "La URL no puede superar los 500 caracteres";
  if (!/^https?:\/\/\S+$/.test(limpio)) return "Debe empezar con http:// o https://";
  return undefined;
};

/** Primer error de un campo, solo si el usuario ya lo tocó o intentó enviar. */
export function errorDeCampo(meta: { isTouched: boolean; errors: unknown[] }): string | undefined {
  if (!meta.isTouched) return undefined;
  const error = meta.errors.find((e) => typeof e === "string");
  return typeof error === "string" ? error : undefined;
}
