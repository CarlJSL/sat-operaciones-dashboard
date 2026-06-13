import axios from "axios";
import type {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { environment } from "@/core/config/environment";
import { errorHandler, type ApiErrorResponse } from "./interceptor/error-handler";
import { useAuthStore } from "@/features/auth/store/authStore";

export const api = axios.create({
  baseURL: environment.baseUrl,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ---------------------------------------------------------------------------
// Request interceptor — inyecta el JWT desde el store de Zustand (single source of truth)
// ---------------------------------------------------------------------------
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — maneja la respuesta centralizada usando errorHandler
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    errorHandler.launchError(error);
    return Promise.reject(error);
  },
);
