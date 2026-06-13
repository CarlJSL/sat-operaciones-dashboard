import { ModalContainer } from "@/shared/components/modal/modalContainer";
import { usuarioService } from "@/shared/services/usuario.service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UsuarioCrearFooter, UsuarioForm } from "../form/usuario-form";

interface UsuarioCrearModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UsuarioCrearModal({
  open,
  onOpenChange,
}: UsuarioCrearModalProps) {
  const [isDirty, setIsDirty] = useState(false);

  // Carga los combos necesarios para el formulario (tipo doc, rol, empresa, etc.)
  const { data: combos, isLoading: loadingCombos } = useQuery({
    queryKey: ["usuario", "initForm"],
    queryFn: () => usuarioService.initForm(),
    enabled: open, // solo fetch cuando el modal se abre
  });

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <ModalContainer
      open={open}
      onOpenChange={onOpenChange}
      title="Crear Usuario"
      showRequiredNote
      className="sm:max-w-3xl"
      dismissible={false}
      footer={
        <UsuarioCrearFooter
          onCancel={() => onOpenChange(false)}
          isDirty={isDirty}
        />
      }
    >
      {loadingCombos ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          Cargando opciones...
        </div>
      ) : (
        <div className="flex flex-col gap-6 -mx-2 p-2">
          <UsuarioForm
            combos={combos}
            onSuccess={handleSuccess}
            onDirtyChange={setIsDirty}
          />
        </div>
      )}
    </ModalContainer>
  );
}
