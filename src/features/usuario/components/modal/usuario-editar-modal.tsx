import { queryClient } from "@/app/providers/QueryProvider";
import { ModalContainer } from "@/shared/components/modal/modalContainer";
import { useState } from "react";
import {
  UsuarioEditarFooter,
  UsuarioEditarForm,
} from "../form/usuario-editar-form";

interface UsuarioEditarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuarioId: string | null;
}

export function UsuarioEditarModal({
  open,
  onOpenChange,
  usuarioId,
}: UsuarioEditarModalProps) {
  const [isDirty, setIsDirty] = useState(false);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && usuarioId) {
      // Limpiar caché del usuario al cerrar para forzar refetch al reabrir
      queryClient.removeQueries({ queryKey: ["usuario", "get", usuarioId] });
    }
    onOpenChange(isOpen);
  };

  return (
    <ModalContainer
      open={open && !!usuarioId}
      onOpenChange={handleOpenChange}
      title="Editar Usuario"
      showRequiredNote
      className="sm:max-w-3xl"
      dismissible={false}
      footer={
        <UsuarioEditarFooter
          onCancel={() => handleOpenChange(false)}
          isDirty={isDirty}
        />
      }
    >
      <div className="flex flex-col gap-6 -mx-2 p-2">
        {/* Solo renderiza el form cuando está abierto — al cerrar se destruye */}
        {open && usuarioId && (
          <UsuarioEditarForm
            onSuccess={handleSuccess}
            onDirtyChange={setIsDirty}
            usuarioId={usuarioId}
          />
        )}
      </div>
    </ModalContainer>
  );
}
