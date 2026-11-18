import type { ReactNode } from "react";
import Button from "./Button";
import type { ButtonVariant } from "./Button";
import Modal from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  variant?: ButtonVariant;
  cargando?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

function ConfirmModal({
  isOpen,
  title,
  children,
  confirmLabel,
  variant = "peligro",
  cargando = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose}>
      <div className="space-y-5 p-6">
        <div className="text-sm text-tinta-700">{children}</div>
        <div className="flex justify-end gap-3">
          <Button variant="secundario" onClick={onClose} disabled={cargando}>
            Volver
          </Button>
          <Button variant={variant} onClick={onConfirm} cargando={cargando}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
