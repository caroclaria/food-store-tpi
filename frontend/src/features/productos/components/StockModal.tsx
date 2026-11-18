import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useNotificationStore } from "@/store/notificationStore";
import { handleApiError } from "@/shared/api/handleApiError";
import FormModal from "@/shared/ui/FormModal";
import { CheckboxField, NumberField } from "@/shared/ui/Input";
import { errorDeCampo, numeroMinimo } from "@/shared/utils/validators";
import { useActualizarStock } from "../hooks/useProductos";
import type { ProductoRead } from "../types/producto.types";

const validarStock = numeroMinimo(0, true);

/** PATCH /productos/{id}/stock: cambia stock y disponibilidad. */
function StockModal({ producto, onClose }: { producto: ProductoRead; onClose: () => void }) {
  const actualizarStock = useActualizarStock();
  const mostrar = useNotificationStore((s) => s.mostrar);
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      try {
        await actualizarStock.mutateAsync({ id: producto.id, body: value });
        mostrar(`Stock de ${producto.nombre} actualizado`);
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
          title={`Stock: ${producto.nombre}`}
          submitLabel="Guardar"
          onClose={onClose}
          onSubmit={() => void form.handleSubmit()}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          errorApi={errorApi}
        >
          <form.Field name="stock" validators={{ onChange: ({ value }) => validarStock(value) }}>
            {(field) => (
              <NumberField
                id="stock"
                label="Unidades en stock"
                min={0}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
                required
              />
            )}
          </form.Field>
          <form.Field name="disponible">
            {(field) => (
              <CheckboxField
                id="disponible"
                label="Disponible para la venta"
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

export default StockModal;
