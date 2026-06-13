import { create } from "zustand";

interface SuccessState {
  isOpen: boolean;
  title: string;
  description: string;
  show: (alert: { description: string; title?: string }) => void;
  close: () => void;
}

export const useSuccessStore = create<SuccessState>((set) => ({
  isOpen: false,
  title: "Operación Exitosa",
  description: "",
  show: ({ title, description }) => set({ isOpen: true, title, description }),
  close: () => set({ isOpen: false }),
}));
