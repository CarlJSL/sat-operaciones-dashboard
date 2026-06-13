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
import type { Usuario, UsuarioFormCombo } from "@/domain/models/usuario";
import {
  FormCard,
  FormField,
  FormRow,
} from "@/shared/components/form/form-layout";
import { usuarioService } from "@/shared/services/usuario.service";
import { useSuccessStore } from "@/shared/store/successStore";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

interface UsuarioFormProps {
  combos: UsuarioFormCombo | undefined;
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

type FormValues = {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumentoCodigo: string;
  documento: string;
  correo: string;
  celular: string;
  usuario: string;
  password: string;
  rolId: string;
};

export function UsuarioForm({
  combos,
  onSuccess,
  onDirtyChange,
}: UsuarioFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      tipoDocumentoCodigo: "",
      documento: "",
      correo: "",
      celular: "",
      usuario: "",
      password: "",
      rolId: "",
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Usuario>) =>
      usuarioService.saveOrUpdate(payload as Usuario),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      useSuccessStore.getState().show({
        title: "Usuario Creado",
        description:
          response?.mensaje || "El usuario se registró correctamente.",
      });
      reset();
      onDirtyChange?.(false);
      onSuccess();
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate({
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      tipoDocumentoCodigo: data.tipoDocumentoCodigo,
      documento: data.documento,
      correo: data.correo,
      celular: data.celular,
      usuario: data.usuario,
      password: data.password,
      rolId: data.rolId,
    });
  };

  const tipoDocumentoItems = combos?.combo?.tipoDocumento?.list ?? [];
  const rolItems = combos?.combo?.rol?.list ?? [];

  return (
    <form
      id="usuario-crear-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoDocumentoItems.map((item) => (
                      <SelectItem key={item.codigo} value={item.codigo ?? ""}>
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
            error={errors.documento?.message}
          >
            <Input
              {...register("documento", { required: "Requerido" })}
              placeholder="Ej: 12345678"
            />
          </FormField>
        </FormRow>

        {/* Fila 2: Nombres y apellidos en 4 columnas */}
        <FormRow cols={4}>
          <FormField label="Nombres" required error={errors.nombres?.message}>
            <Input
              {...register("nombres", { required: "Requerido" })}
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
            <Input {...register("apellidoMaterno")} placeholder="Ej: López" />
          </FormField>

          <FormField label="Celular" error={errors.celular?.message}>
            <Input {...register("celular")} placeholder="Ej: 987654321" />
          </FormField>
        </FormRow>

        {/* Fila 3: Correo — ocupa todo el ancho */}
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

      {/* --- TARJETA 2: DATOS DE SISTEMA --- */}
      <FormCard>
        <FormRow cols={4}>
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rolItems.map((item) => (
                      <SelectItem key={item.id} value={String(item.id ?? "")}>
                        {item.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Usuario" required error={errors.usuario?.message} colSpan={2}>
            <Input
              {...register("usuario", { required: "Requerido" })}
              placeholder="Ej: jgarcia"
              autoComplete="off"
            />
          </FormField>
        </FormRow>
      </FormCard>

      {/* Footer oculto — los botones los pasa el modal via prop */}
      <button type="submit" form="usuario-crear-form" className="hidden" />
    </form>
  );
}

export function UsuarioCrearFooter({
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
        form="usuario-crear-form"
        disabled={isSubmitting || !isDirty}
        className="cursor-pointer"
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
    </>
  );
}
