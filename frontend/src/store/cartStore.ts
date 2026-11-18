import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  /** Datos de presentación: no se envían al backend. */
  imagen_url: string | null;
  stock: number;
}

export type ProductoParaCarrito = Omit<CartItem, "cantidad">;

interface CartState {
  items: CartItem[];
  /** Devuelve false si no se pudo agregar por falta de stock. */
  agregar: (producto: ProductoParaCarrito, cantidad?: number) => boolean;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) => {
        const existente = get().items.find((i) => i.producto_id === producto.producto_id);
        const nuevaCantidad = (existente?.cantidad ?? 0) + cantidad;
        if (nuevaCantidad > producto.stock) return false;
        set((state) => ({
          items: existente
            ? state.items.map((i) =>
                i.producto_id === producto.producto_id
                  ? { ...i, ...producto, cantidad: nuevaCantidad }
                  : i
              )
            : [...state.items, { ...producto, cantidad }],
        }));
        return true;
      },

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === productoId
              ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.stock)) }
              : i
          ),
        })),

      vaciar: () => set({ items: [] }),

      total: () =>
        Math.round(get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0) * 100) /
        100,

      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    {
      name: "foodstore-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
