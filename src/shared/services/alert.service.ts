import { useAlertStore } from "@/shared/store/alertStore";
import type { AlertVariant } from "@/shared/store/alertStore";

export const alertService = {
  error: (message: string, title?: string, statusCode?: number, onCloseAction?: () => void) =>
    useAlertStore.getState().show({ message, title, variant: "destructive", statusCode, onCloseAction }),

  success: (message: string, title?: string, statusCode?: number, onCloseAction?: () => void) =>
    useAlertStore.getState().show({ message, title, variant: "success", statusCode, onCloseAction }),

  show: (message: string, variant: AlertVariant = "default", title?: string, statusCode?: number, onCloseAction?: () => void) =>
    useAlertStore.getState().show({ message, title, variant, statusCode, onCloseAction }),
};
