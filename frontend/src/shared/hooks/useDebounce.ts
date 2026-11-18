import { useEffect, useState } from "react";

/** Devuelve el valor recién cuando dejó de cambiar durante `ms` milisegundos. */
export function useDebounce<T>(value: T, ms = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return debounced;
}
