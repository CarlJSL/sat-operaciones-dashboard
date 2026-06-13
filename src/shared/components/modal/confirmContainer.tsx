import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogMedia,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirmStore } from "@/shared/store/confirmStore";
import * as Icons from "lucide-react";
import { useState } from "react";

function getAlertIcon(iconName?: string, iconColor?: string): ReactNode {
  if (!iconName) return null;
  
  // Mapeo de nombres conocidos a iconos predeterminados
  if (iconName === "destructive") {
    return <Icons.BadgeX className={iconColor ? `size-16 ${iconColor}` : "size-16 text-brand-destructive"} />;
  }
  if (iconName === "success") {
    return <Icons.BadgeCheck className={iconColor ? `size-16 ${iconColor}` : "size-16 text-brand-success"} />;
  }
  
  // Obtener el icono de lucide-react por nombre
  const IconComponent = (Icons as Record<string, any>)[iconName];
  if (!IconComponent) return null;
  
  return <IconComponent className={iconColor ? `size-16 ${iconColor}` : "size-16 text-brand-primary"} />;
}

const sizeClasses = {
  xs: "max-w-[280px] sm:max-w-xs",
  sm: "max-w-xs sm:max-w-sm",
  md: "max-w-sm sm:max-w-md",
  lg: "max-w-md sm:max-w-lg",
};

export function ConfirmContainer() {
  const { isOpen, title, message, description, size, onConfirm, close, icon, iconColor, cancelText, confirmText, confirmVariant } = useConfirmStore();
  const [loading, setLoading] = useState(false);

  const variante = getAlertIcon(icon, iconColor);
  const sizeClass = size ? sizeClasses[size] : sizeClasses.sm;

  async function handleConfirm() {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      close();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent
        showCloseButton={false}
        className={`${sizeClass} text-center`}
      >
        <DialogHeader className="items-center gap-3">
          {variante && (
            <DialogMedia className="size-16 [&_svg]:size-50">
              {variante}
            </DialogMedia>
          )}
          <DialogTitle className="text-2xl font-bold text-center">
            {title ?? "¿Estás seguro?"}
          </DialogTitle>
          <DialogDescription className="text-lg text-center">
            {message}
          </DialogDescription>
          {description && (
            <p className="text-sm text-balance text-muted-foreground text-center">
              {description}
            </p>
          )}
        </DialogHeader>

        <DialogFooter className="flex justify-center gap-3 sm:justify-center mt-2 p-3">
          <Button variant="outline" onClick={close} disabled={loading}>
            {cancelText ?? "Cancelar"}
          </Button>
          <Button variant={confirmVariant ?? "default"} onClick={handleConfirm} disabled={loading}>
            {loading ? "Procesando..." : (confirmText ?? "Aceptar")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
