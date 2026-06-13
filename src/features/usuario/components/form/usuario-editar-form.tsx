import { queryClient } from "@/app/providers/QueryProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Usuario } from "@/domain/models/usuario";
import {
  FormCard,
  FormField,
  FormRow,
} from "@/shared/components/form/form-layout";
import { usuarioService } from "@/shared/services/usuario.service";
import { useSuccessStore } from "@/shared/store/successStore";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface UsuarioEditarFormProps {
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  usuarioId: string;
}

type FormValues = {
  nombreCompleto: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumentoCodigo: string;
  numeroDocumento: string;
  correo: string;
  celular: string;
  usuario: string;
  rolId: string;
};

export function UsuarioEditarForm({
  onSuccess,
  onDirtyChange,
  usuarioId,
}: UsuarioEditarFormProps) {
  const { data: usuarioData, isLoading } = useQuery({
    queryKey: ["usuario", "get", usuarioId],
    queryFn: () => usuarioService.get(usuarioId),
    staleTime: 0,
  });


  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      nombreCompleto: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      tipoDocumentoCodigo: "",
      numeroDocumento: "",
      correo: "",
      celular: "",
      usuario: "",
      rolId: "",
    },
  });

  // Sincronizar form cuando llegan los datos del API
  useEffect(() => {
    if (usuarioData) {
      reset({
        nombreCompleto: usuarioData.nombreCompleto || "",
        apellidoPaterno: usuarioData.apellidoPaterno || "",
        apellidoMaterno: usuarioData.apellidoMaterno || "",
        tipoDocumentoCodigo: usuarioData.tipoDocumentoCodigo || "",
        numeroDocumento: usuarioData.numeroDocumento || "",
        correo: usuarioData.correo || "",
        celular: usuarioData.celular || "",
        usuario: usuarioData.usuario || "",
        rolId: String(usuarioData.rolId || ""),
      });
    }
  }, [usuarioData, reset]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Usuario>) =>
      usuarioService.saveOrUpdate({ ...payload, usuarioId } as Usuario),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      useSuccessStore.getState().show({
        title: "Usuario Actualizado",
        description:
          response?.mensaje || "El usuario se actualizó correctamente.",
      });
      reset();
      onDirtyChange?.(false);
      onSuccess();
    },
  });

  const onSubmit = (data: FormValues) => {
    updateMutation.mutate({
      nombreCompleto: data.nombreCompleto,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      tipoDocumentoCodigo: data.tipoDocumentoCodigo,
      numeroDocumento: data.numeroDocumento,
      correo: data.correo,
      celular: data.celular,
      usuario: data.usuario,
      rolId: data.rolId,
    });
  };

  const combos = usuarioData?.combo;

  const tipoDocumentoItems = combos?.tipoDocumento?.list ?? [];
  const rolItems = combos?.roles?.list ?? [];

  return (
    <form
      id="usuario-editar-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      )}
          <FormCard>
            {/* Fila 1: Tipo y número de documento */}
            <FormRow>
              <FormField
                label="Tipo de documento"
                required
                error={errors.tipoDocumentoCodigo?.message}
              >
                <Controller
                  name="tipoDocumentoCodigo"
                  control={control}
                  rules={{ required: "Requerido" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {tipoDocumentoItems.map((item) => (
                          <SelectItem
                            key={item.codigo}
                            value={item.codigo ?? ""}
                          >
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                label="Número de documento"
                required
                error={errors.numeroDocumento?.message}
              >
                <Input
                  {...register("numeroDocumento", { required: "Requerido" })}
                  placeholder="Ej: 12345678"
                  disabled={true}
                />
              </FormField>
            </FormRow>

            {/* Fila 2: nombreCompleto y apellidos en 4 columnas */}
            <FormRow cols={4}>
              <FormField
                label="nombreCompleto"
                required
                error={errors.nombreCompleto?.message}
              >
                <Input
                  {...register("nombreCompleto", { required: "Requerido" })}
                  placeholder="Ej: Juan Carlos"
                />
              </FormField>

              <FormField
                label="Apellido paterno"
                required
                error={errors.apellidoPaterno?.message}
              >
                <Input
                  {...register("apellidoPaterno", { required: "Requerido" })}
                  placeholder="Ej: García"
                />
              </FormField>

              <FormField
                label="Apellido materno"
                error={errors.apellidoMaterno?.message}
              >
                <Input
                  {...register("apellidoMaterno")}
                  placeholder="Ej: López"
                />
              </FormField>

              <FormField label="Teléfono" error={errors.celular?.message}>
                <Input {...register("celular")} placeholder="Ej: 987654321" />
              </FormField>
            </FormRow>

            {/* Fila 3: Correo — ancho completo */}
            <FormField
              label="Correo electrónico"
              required
              error={errors.correo?.message}
            >
              <Input
                type="email"
                {...register("correo", {
                  required: "Requerido",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Correo inválido",
                  },
                })}
                placeholder="Ej: usuario@empresa.com"
              />
            </FormField>
          </FormCard>
          <FormCard>
            <FormRow cols={4}>
              <FormField
                label="Usuario"
                required
                error={errors.usuario?.message}
                colSpan={2}
              >
                <Input
                  {...register("usuario", { required: "Requerido" })}
                  placeholder="Ej: jgarcia"
                  autoComplete="off"
                  disabled
                />
              </FormField>

              <FormField
                label="Rol"
                required
                error={errors.rolId?.message}
                colSpan={2}
              >
                <Controller
                  name="rolId"
                  control={control}
                  rules={{ required: "Requerido" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {rolItems.map((item) => (
                          <SelectItem
                            key={item.id}
                            value={String(item.id ?? "")}
                          >
                            {item.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              {/* Removemos la contraseña del modo edición */}
            </FormRow>
          </FormCard>
      <button type="submit" form="usuario-editar-form" className="hidden" />
    </form>
  );
}

export function UsuarioEditarFooter({
  onCancel,
  isSubmitting,
  isDirty = false,
}: {
  onCancel: () => void;
  isSubmitting?: boolean;
  isDirty?: boolean;
}) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSubmitting}
        className="cursor-pointer"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="usuario-editar-form"
        disabled={isSubmitting || !isDirty}
        className="cursor-pointer"
      >
        {isSubmitting ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </>
  );
}
