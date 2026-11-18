import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useNotificationStore } from "@/store/notificationStore";
import { handleApiError } from "@/shared/api/handleApiError";
import FormModal from "@/shared/ui/FormModal";
import { TextField } from "@/shared/ui/Input";
import { errorDeCampo, textoOpcional, textoRequerido } from "@/shared/utils/validators";
import { useActualizarCategoria, useCrearCategoria } from "../hooks/useCategorias";
import type { CategoriaRead } from "../types/categoria.types";

interface CategoriaFormModalProps {
  /** null = alta; una categoría = edición. */
  categoria: CategoriaRead | null;
  onClose: () => void;
}

const validarNombre = textoRequerido(2, 100);
const validarDescripcion = textoOpcional(500);

// Se monta con key distinta por registro: los valores iniciales se toman al montar.
function CategoriaFormModal({ categoria, onClose }: CategoriaFormModalProps) {
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const mostrar = useNotificationStore((s) => s.mostrar);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      const body = { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null };
      try {
        if (categoria) {
          await actualizar.mutateAsync({ id: categoria.id, body });
          mostrar("Categoría actualizada");
        } else {
          await crear.mutateAsync(body);
          mostrar("Categoría creada");
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
          title={categoria ? "Editar categoría" : "Nueva categoría"}
          submitLabel={categoria ? "Guardar cambios" : "Crear"}
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
        </FormModal>
      )}
    </form.Subscribe>
  );
}

export default CategoriaFormModal;
