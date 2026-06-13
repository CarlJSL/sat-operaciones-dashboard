import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  description?: string;
  triggerButton?: ReactNode;
  children: ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showRequiredNote?: boolean;
  footer?: ReactNode;
  dismissible?: boolean; // false = solo se cierra con la X
}

export function ModalContainer({
  title,
  description,
  triggerButton,
  children,
  className,
  open,
  onOpenChange,
  showRequiredNote,
  footer,
  dismissible = true,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}

      <DialogContent
        className={`overflow-y-auto max-h-[90vh] ${className}`}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={dismissible ? undefined : (e) => e.preventDefault()}
        onEscapeKeyDown={dismissible ? undefined : (e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {showRequiredNote && (
            <p className="text-xs text-slate-500 mt-1">
              <span className="text-brand-destructive">*</span> El asterisco
              indica que son campos obligatorios
            </p>
          )}
          {description && (
            <DialogDescription className="text-sm text-slate-500 mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-1.5">{children}</div>

        {footer && (
          <DialogFooter className="flex justify-center gap-3 sm:justify-center">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
