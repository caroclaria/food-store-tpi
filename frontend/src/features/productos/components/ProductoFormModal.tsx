import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import type { CategoriaRead } from "@/features/categorias/types/categoria.types";
import { useNotificationStore } from "@/store/notificationStore";
import { handleApiError } from "@/shared/api/handleApiError";
import FormModal from "@/shared/ui/FormModal";
import { CheckboxField, NumberField, SelectField, TextField } from "@/shared/ui/Input";
import {
  errorDeCampo,
  numeroMinimo,
  textoOpcional,
  textoRequerido,
  validarUrlOpcional,
} from "@/shared/utils/validators";
import { useActualizarProducto, useCrearProducto } from "../hooks/useProductos";
import type { ProductoCreate, ProductoRead } from "../types/producto.types";

interface ProductoFormModalProps {
  /** null = alta; un producto = edición. */
  producto: ProductoRead | null;
  categorias: CategoriaRead[];
  onClose: () => void;
}

const validarNombre = textoRequerido(2, 150);
const validarDescripcion = textoOpcional(500);
const validarPrecio = numeroMinimo(0);
const validarStock = numeroMinimo(0, true);

// Se monta con key distinta por registro: los valores iniciales se toman al montar.
function ProductoFormModal({ producto, categorias, onClose }: ProductoFormModalProps) {
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const mostrar = useNotificationStore((s) => s.mostrar);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto?.precio_base ?? NaN,
      imagen_url: producto?.imagen_url ?? "",
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto ? String(producto.categoria_id) : "",
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      const body: ProductoCreate = {
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      };
      try {
        if (producto) {
          await actualizar.mutateAsync({ id: producto.id, body });
          mostrar("Producto actualizado");
        } else {
          await crear.mutateAsync(body);
          mostrar("Producto creado");
        }
        onClose();
      } catch (error) {
        setErrorApi(handleApiError(error));
      }
    },
  });

  return (
    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
      {([canSubmit, isSubmitting]) => (
        <FormModal
          isOpen
          title={producto ? "Editar producto" : "Nuevo producto"}
          submitLabel={producto ? "Guardar cambios" : "Crear"}
          onClose={onClose}
          onSubmit={() => void form.handleSubmit()}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          errorApi={errorApi}
        >
          <form.Field name="nombre" validators={{ onChange: ({ value }) => validarNombre(value) }}>
            {(field) => (
              <TextField
                id="nombre"
                label="Nombre"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
                autoFocus
                required
              />
            )}
          </form.Field>

          <form.Field
            name="categoria_id"
            validators={{ onChange: ({ value }) => (value ? undefined : "Elegí una categoría") }}
          >
            {(field) => (
              <SelectField
                id="categoria_id"
                label="Categoría"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
                placeholder="Seleccioná una categoría"
                options={categorias.map((c) => ({ value: String(c.id), label: c.nombre }))}
                required
              />
            )}
          </form.Field>

          <form.Field name="descripcion" validators={{ onChange: ({ value }) => validarDescripcion(value) }}>
            {(field) => (
              <TextField
                id="descripcion"
                label="Descripción"
                multiline
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
              />
            )}
          </form.Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="precio_base" validators={{ onChange: ({ value }) => validarPrecio(value) }}>
              {(field) => (
                <NumberField
                  id="precio_base"
                  label="Precio"
                  prefix="$"
                  min={0}
                  step={0.01}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  error={errorDeCampo(field.state.meta)}
                  required
                />
              )}
            </form.Field>
            <form.Field name="stock" validators={{ onChange: ({ value }) => validarStock(value) }}>
              {(field) => (
                <NumberField
                  id="stock"
                  label="Stock"
                  min={0}
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                  error={errorDeCampo(field.state.meta)}
                  required
                />
              )}
            </form.Field>
          </div>

          <form.Field name="imagen_url" validators={{ onChange: ({ value }) => validarUrlOpcional(value) }}>
            {(field) => (
              <TextField
                id="imagen_url"
                label="URL de la imagen"
                type="url"
                placeholder="https://..."
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
              />
            )}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <CheckboxField
                id="disponible"
                label="Disponible para la venta"
                description="Si lo desmarcás, sigue en el catálogo pero no se puede pedir."
                checked={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        </FormModal>
      )}
    </form.Subscribe>
  );
}

export default ProductoFormModal;
