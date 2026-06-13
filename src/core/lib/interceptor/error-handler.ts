import type { AxiosError } from "axios";
import { alertService } from "@/shared/services/alert.service";
import { useAuthStore } from "@/features/auth/store/authStore";

// Interfaz que simula la respuesta que envía tu backend en el JSON
export interface ApiErrorResponse {
  systemMessage?: string;
  userMessage?: string;
  errorCode?: string;
}

export const errorHandler = {
  launchError: (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status || 0;
    const errorData = error.response?.data;

    // Equivalente a alertType en Angular
    const isWarning = [400, 401, 403, 406, 500].includes(status);
    const variant = isWarning ? "default" : "destructive";
    const defaultTitle = isWarning ? "Advertencia" : "Error";

    // Limpia el store de Zustand (que a su vez limpia la persistencia en localStorage)
    const logout = () => {
      useAuthStore.getState().clearAuth();
      setTimeout(() => {
        window.location.replace("/login"); // Usamos window.location al no estar dentro del Router de React
      }, 2000); // Dar tiempo a que se muestre la alerta
    };

    if (status === 0) {
      alertService.show(
        errorData?.systemMessage ||
          "Ops!, Se ha presentado un inconveniente, vuelva a ingresar a la plataforma",
        variant,
        defaultTitle,
        status,
      );
      return;
    }

    if (status === 401) {
      alertService.show(
        errorData?.systemMessage ||
          "Su sesión ha expirado, ingrese nuevamente.",
        variant,
        "Sesión expirada",
        status,
      );
      logout();
      return;
    }

    if (status === 400) {
      alertService.show(
        errorData?.userMessage ||
          errorData?.systemMessage ||
          "Usuario o Contraseña Incorrecta",
        variant,
        "Información Incorrecta",
        status,
      );
      return;
    }

    if (status === 403) {
      alertService.show(
        errorData?.userMessage ||
          errorData?.systemMessage ||
          "No tiene permisos para realizar esta acción.",
        "default",
        "Acceso denegado",
        status,
      );
      return;
    }

    if (status === 404) {
      alertService.show(
        errorData?.userMessage ||
          errorData?.systemMessage ||
          "Recurso no encontrado",
        variant,
        defaultTitle,
        status,
      );
      return;
    }

    if (status === 406) {
      alertService.show(
        errorData?.userMessage ||
          errorData?.systemMessage ||
          "Ocurrió un problema al procesar la solicitud",
        variant,
        defaultTitle,
        status,
      );
      return;
    }

    if (status === 500 && errorData) {
      if (errorData.errorCode === "ACCESS") {
        window.location.replace("/"); // replaceUrl: true
      }

      alertService.show(
        errorData?.userMessage || errorData?.systemMessage || "Error interno",
        variant,
        defaultTitle,
        status,
      );
      return;
    }

    if (status > 500) {
      alertService.show(
        errorData?.userMessage ||
          errorData?.systemMessage ||
          "Se ha presentado un inconveniente, vuelva a ingresar a la plataforma",
        variant,
        defaultTitle,
        status,
      );
      return;
    }

    if (errorData && errorData.systemMessage) {
      alertService.show(errorData.systemMessage, variant, defaultTitle, status);
    }
  },
};
