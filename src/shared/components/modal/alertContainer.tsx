import { useAlertStore } from "@/shared/store/alertStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogMedia,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OctagonXIcon, TriangleAlertIcon, CircleCheckIcon } from "lucide-react";
import type { AlertVariant } from "@/shared/store/alertStore";

function getAlertIcon(variant: AlertVariant) {
  if (variant === "destructive") {
    return <OctagonXIcon className="size-16 text-destructive" />;
  }
  if (variant === "default") {
    return <TriangleAlertIcon className="size-16 text-chart-4" />;
  }
  if (variant === "success") {
    return <CircleCheckIcon className="size-16 text-green-500" />;
  }
  return null;
}

export function AlertContainer() {
  const { isOpen, title, message, variant, close } = useAlertStore();

  const icon = getAlertIcon(variant);

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent
        showCloseButton={false}
        className="w-90 text-center overflow-y-auto max-h-[90vh]"
      >
        <DialogHeader className="items-center gap-3">
          {icon && (
            <DialogMedia className="size-16 [&_svg]:size-50">
              {icon}
            </DialogMedia>
          )}
          <DialogTitle className="text-2xl font-bold text-center">
            {title ?? "Aviso"}
          </DialogTitle>
          <DialogDescription
            className="text-sm text-center wrap-break-word line-clamp-6"
            title={typeof message === "string" ? message : undefined}
          >
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="items-center justify-center sm:justify-center mt-2 p-3">
          <Button onClick={close} size="lg">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

