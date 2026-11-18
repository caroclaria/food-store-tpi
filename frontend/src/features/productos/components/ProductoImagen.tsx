import { useState } from "react";
import { estiloCategoria } from "@/shared/utils/format";

interface ProductoImagenProps {
  url: string | null;
  nombre: string;
  categoria: string;
  className?: string;
  emojiClassName?: string;
}

/** Imagen del producto; si no tiene o no carga, un fondo pastel con emoji. */
function ProductoImagen({ url, nombre, categoria, className = "", emojiClassName = "text-5xl" }: ProductoImagenProps) {
  const [fallo, setFallo] = useState(false);
  const { emoji, fondo } = estiloCategoria(categoria);

  if (!url || fallo) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br ${fondo} ${className}`}>
        <span className={emojiClassName} role="img" aria-label={nombre}>
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={nombre}
      loading="lazy"
      onError={() => setFallo(true)}
      className={`object-cover ${className}`}
    />
  );
}

export default ProductoImagen;
