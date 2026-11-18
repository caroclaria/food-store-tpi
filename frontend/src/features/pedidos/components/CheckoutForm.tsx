import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import Button from "@/shared/ui/Button";
import { TextField } from "@/shared/ui/Input";
import { errorDeCampo, textoOpcional, textoRequerido } from "@/shared/utils/validators";
import type { FormaPago } from "../types/pedido.types";
import { ETIQUETA_FORMA_PAGO } from "../types/pedido.types";

export interface DatosCheckout {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

interface CheckoutFormProps {
  onSubmit: (datos: DatosCheckout) => Promise<void>;
  errorApi: string | null;
}

const OPCIONES_PAGO: { value: FormaPago; icono: string; detalle: string }[] = [
  { value: "EFECTIVO", icono: "💵", detalle: "Pagás al recibir el pedido" },
  { value: "TRANSFERENCIA", icono: "🏦", detalle: "Te enviamos el alias por mensaje" },
];

const validarDireccion = textoRequerido(5, 200);
const validarNotas = textoOpcional(500);

function CheckoutForm({ onSubmit, errorApi }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: { direccion_entrega: "", forma_pago: "EFECTIVO", notas: "" } as DatosCheckout,
    onSubmit: async ({ value }) => onSubmit(value),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <form.Field name="direccion_entrega" validators={{ onChange: ({ value }) => validarDireccion(value) }}>
        {(field) => (
          <TextField
            id="direccion_entrega"
            label="Dirección de entrega"
            placeholder="Ej.: Av. San Martín 1234, piso 2 B"
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={errorDeCampo(field.state.meta)}
            autoComplete="street-address"
            hint="Entre 5 y 200 caracteres"
            required
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset>
            <legend className="mb-1.5 text-sm font-bold text-tinta-700">
              Forma de pago<span className="ml-0.5 text-rosa-700">*</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {OPCIONES_PAGO.map((op) => {
                const activo = field.state.value === op.value;
                return (
                  <label
                    key={op.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl p-4 ring-2 transition-colors ${
                      activo ? "bg-lavanda-50 ring-lavanda-300" : "bg-crema-50 ring-crema-200 hover:ring-crema-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="forma_pago"
                      value={op.value}
                      checked={activo}
                      onChange={() => field.handleChange(op.value)}
                      onBlur={field.handleBlur}
                      className="sr-only"
                    />
                    <span className="text-2xl" aria-hidden="true">
                      {op.icono}
                    </span>
                    <span>
                      <span className="block font-extrabold text-tinta-900">{ETIQUETA_FORMA_PAGO[op.value]}</span>
                      <span className="block text-xs text-tinta-500">{op.detalle}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: ({ value }) => validarNotas(value) }}>
        {(field) => (
          <TextField
            id="notas"
            label="Notas (opcional)"
            placeholder="Ej.: sin cebolla, tocar timbre 2"
            multiline
            value={field.state.value}
            onChange={field.handleChange}
            onBlur={field.handleBlur}
            error={errorDeCampo(field.state.meta)}
          />
        )}
      </form.Field>

      {errorApi && (
        <p role="alert" className="rounded-xl bg-rosa-50 p-3 text-sm font-semibold text-rosa-800 ring-1 ring-rosa-200">
          {errorApi}
        </p>
      )}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" size="lg" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default CheckoutForm;
