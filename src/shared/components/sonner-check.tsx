"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useSuccessStore } from "../store/successStore";

export function SonnerDescription() {
  const { isOpen, title, description, close } = useSuccessStore();
  useEffect(() => {
    if (isOpen) {
      toast.success(title || "Operación Exitosa", {
        description: description,
    classNames: {
          toast: '!bg-brand-success-foreground !border-brand-success',         // Fondo y borde de la caja
          title: '!text-brand-success font-bold',               // El título principal
          description: '!text-brand-success',                   // La descripción
          icon: '!text-brand-success'                           // El color del check verde
        }
      });
      // Reseteamos el estado para evitar que se repita el toast
      close();
    }
  }, [isOpen, title, description, close]);
  // Este componente no renderiza nada visual, solo escucha la lógica
  return null;
}
