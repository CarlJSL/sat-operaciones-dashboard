import { create } from "zustand";

export type AlertVariant = "default" | "destructive" | "success";

interface AlertState {
  isOpen: boolean;
  title?: string;
  message: string;
  variant: AlertVariant;
  statusCode?: number;
  onCloseAction?: () => void;
  show: (alert: { message: string; title?: string; variant?: AlertVariant; statusCode?: number; onCloseAction?: () => void }) => void;
  close: () => void;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  isOpen: false,
  title: undefined,
  message: "",
  variant: "destructive",
  statusCode: undefined,
  onCloseAction: undefined,
  show: ({ message, title, variant = "destructive", statusCode, onCloseAction }) =>
    set({ isOpen: true, message, title, variant, statusCode, onCloseAction }),
  close: () => {
    get().onCloseAction?.();
    set({ isOpen: false, onCloseAction: undefined });
  },
}));
