import { queryClient } from "@/app/providers/QueryProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Catalogo } from "@/domain/models";
import { catalogoService } from "@/shared/services/catalogo.service";
import {
  FormCard,
  FormField,
  FormRow,
} from "@/shared/components/form/form-layout";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useSuccessStore } from "@/shared/store/successStore";

interface CreateSubItemFormProps {
  referenciaCodigo: string;
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

type FormValues = {
  nombre: string;
  descripcion: string;
  valor1: string;
  valor2: string;
};

export function CreateSubItemForm({
  referenciaCodigo,
  onSuccess,
  onDirtyChange,
}: CreateSubItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: "",
      descripcion: "",
      valor1: "",
      valor2: "",
    },
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const createMutation = useMutation({
    mutationFn: (dataToSave: Catalogo) => catalogoService.saveOrUpdate(dataToSave),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["catalogos"] });
      useSuccessStore.getState().show({
        title: "Subítem Creado",
        description: response?.mensaje || "El subítem se registró correctamente.",
      });
      reset();
      onDirtyChange?.(false);
      onSuccess();
    },
  });

  const onSubmit = (data: FormValues) => {
    const payload: Catalogo = {
      catalogoId: "",
      codigo: "",
      nombre: data.nombre,
      descripcion: data.descripcion,
      orden: 0,
      referenciaCodigo,
      valor1: data.valor1,
      valor2: data.valor2,
      prefijo: "",
      seleccionado: false,
      habilitado: true,
    };

    createMutation.mutate(payload);
  };

  return (
    <form id="create-subitem-form" onSubmit={handleSubmit(onSubmit)}>
      <FormCard>
        <FormField label="Nombre" required error={errors.nombre?.message}>
          <Input {...register("nombre", { required: "Requerido" })} />
        </FormField>

        <FormRow>
          <FormField label="Valor 1">
            <Input {...register("valor1")} />
          </FormField>
          <FormField label="Valor 2">
            <Input {...register("valor2")} />
          </FormField>
        </FormRow>

        <FormField
          label="Descripción"
          required
          colSpan="full"
          error={errors.descripcion?.message}
        >
          <Textarea
            {...register("descripcion", { required: "Requerido" })}
            className="resize-none min-h-18"
          />
        </FormField>
      </FormCard>
    </form>
  );
}

export function CreateSubItemFooter({
  onCancel,
  isSubmitting,
  isDirty = true,
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
        form="create-subitem-form"
        disabled={isSubmitting || !isDirty}
        className="cursor-pointer"
      >
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
    </>
  );
}
