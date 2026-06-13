import { queryClient } from "@/app/providers/QueryProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Catalogo } from "@/domain/models";
import { catalogoService } from "@/shared/services/catalogo.service";
import {
  FormCard,
  FormField,
  FormRow,
} from "@/shared/components/form/form-layout";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSuccessStore } from "@/shared/store/successStore";

interface EditSubItemFormProps {
  catalogo: Catalogo;
  onSuccess: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

type FormValues = {
  nombre: string;
  descripcion: string;
  orden: number;
  valor1: string;
  valor2: string;
};

export function EditSubItemForm({ catalogo, onSuccess, onDirtyChange }: EditSubItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>();

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Fetch the fresh data from the server
  const { data: frechData, isLoading, isError } = useQuery({
    queryKey: ["catalogo", catalogo.catalogoId],
    queryFn: () => catalogoService.get(catalogo.catalogoId),
    enabled: !!catalogo.catalogoId,
  });

  useEffect(() => {
    // Only reset the form when the fresh data is successfully fetched
    if (frechData) {
      reset({
        nombre: frechData.nombre || "",
        descripcion: frechData.descripcion || "",
        orden: frechData.orden || 0,
        valor1: frechData.valor1 || "",
        valor2: frechData.valor2 || "",
      });
    }
  }, [frechData, reset]);

  // Mutación para guardar o actualizar
  const updateMutation = useMutation({
    mutationFn: (dataToSave: Catalogo) => catalogoService.saveOrUpdate(dataToSave),
    onSuccess: (response) => {
      // 1. Recargar la tabla
      queryClient.invalidateQueries({ queryKey: ["catalogos"] });
      // 2. Notificación sutil
          useSuccessStore.getState().show({
        title: "Subítem Actualizado",
        description: response?.mensaje || "Se guardaron los cambios exitosamente.",
      });
      // 3. Cerrar el modal
      onSuccess();
    },
  });

  const onSubmit = (data: FormValues) => {
    // Mezclar datos cacheados/frescos con los del form
    const baseData = frechData || catalogo;
    updateMutation.mutate({ ...baseData, ...data });
  };

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Cargando datos...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-red-500">
        Error al cargar los datos del catálogo.
      </div>
    );
  }

  return (
    <form id="edit-subitem-form" onSubmit={handleSubmit(onSubmit)}>
      <FormCard>
        {/* Fila 1: Código | Nombre */}
        <FormRow>
          <FormField label="Código:">
            <Input value={catalogo.codigo} readOnly className="bg-muted" />
          </FormField>
          <FormField label="Nombre" required error={errors.nombre?.message}>
            <Input {...register("nombre", { required: "Requerido" })} />
          </FormField>
        </FormRow>

        {/* Fila 2: Valor 1 | Valor 2 */}
        <FormRow>
          <FormField label="Valor 1:">
            <Input {...register("valor1")} />
          </FormField>
          <FormField label="Valor 2:">
            <Input {...register("valor2")} placeholder="Ingrese el valor 2" />
          </FormField>
        </FormRow>

        {/* Fila 3: Descripción ancho completo */}
        <FormField
          label="Descripción"
          required
          colSpan="full"
          error={errors.descripcion?.message}
        >
          <Textarea
            {...register("descripcion", { required: "Requerido" })}
            className="min-h-18 resize-none"
          />
        </FormField>
      </FormCard>
    </form>
  );
}

export function EditSubItemFooter({
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
      <Button type="submit" form="edit-subitem-form" disabled={isSubmitting || !isDirty} className="cursor-pointer">
        {isSubmitting ? "Guardando..." : "Guardar"}
      </Button>
    </>
  );
}
