import type { FormEvent, ReactNode } from "react";
import Button from "./Button";
import Modal from "./Modal";

interface FormModalProps {
  isOpen: boolean;
  title: string;
  submitLabel: string;
  onClose: () => void;
  /** Dispara form.handleSubmit() de TanStack Form. */
  onSubmit: () => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  /** Error devuelto por la API: se muestra sin cerrar el modal. */
  errorApi: string | null;
  children: ReactNode;
}

function FormModal({
  isOpen,
  title,
  submitLabel,
  onClose,
  onSubmit,
  canSubmit,
  isSubmitting,
  errorApi,
  children,
}: FormModalProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSubmit();
  };

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
        {children}

        {errorApi && (
          <p role="alert" className="rounded-xl bg-rosa-50 p-3 text-sm font-semibold text-rosa-800 ring-1 ring-rosa-200">
            {errorApi}
          </p>
        )}

        <div className="flex justify-end gap-3 border-t border-crema-200 pt-4">
          <Button variant="secundario" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default FormModal;
