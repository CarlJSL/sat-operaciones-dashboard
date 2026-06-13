import { create } from "zustand";

export type ConfirmVariant = "success" | "destructive";
export type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
export type ConfirmSize = "xs" | "sm" | "md" | "lg";

interface ConfirmState {
    isOpen: boolean;
    title?: string;
    message: string;
    description?: string;
    size?: ConfirmSize;
    icon?: string; // Nombre del icono de lucide-react
    iconColor?: string; // Color personalizado del icono
    cancelText?: string;
    confirmText?: string;
    confirmVariant?: ButtonVariant;
    onConfirm: () => Promise<void> | void;
    show: (opts: {
        message: string;
        title?: string;
        description?: string;
        size?: ConfirmSize;
        icon?: string; // Nombre del icono
        iconColor?: string;
        cancelText?: string;
        confirmText?: string;
        confirmVariant?: ButtonVariant;
        onConfirm: () => Promise<void> | void;
    }) => void;
    close: () => void;
}

export const useConfirmStore = create<ConfirmState>((set) => ({
    isOpen: false,
    title: undefined,
    description: undefined,
    size: "sm",
    icon: "success",
    iconColor: undefined,
    cancelText: undefined,
    confirmText: undefined,
    confirmVariant: "default",
    message: "",
    onConfirm: async () => { },
    show: ({ message, title, description, size = "sm", icon = "success", iconColor, cancelText, confirmText, confirmVariant = "default", onConfirm }) =>
        set({ isOpen: true, message, title, description, size, icon, iconColor, cancelText, confirmText, confirmVariant, onConfirm }),
    close: () => set({ isOpen: false })

})) 