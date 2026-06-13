import { api } from "@/core/lib/api";
import { authAdapter } from "@/core/adapters/auth.adapter";
import type { LoginRequestDTO } from "@/core/adapters/auth.adapter";
import type { LoginResponse } from "@/domain/auth";

export const authService = {
  login: async (payload: LoginRequestDTO): Promise<LoginResponse> => {
    const { data } = await api.post("/auth/login", payload);
    return authAdapter.fromLoginDTO(data);
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  forgotPasword: async (correo: string): Promise<void> => {
    await api.post("/auth/recuperarClave", { correo });
  },

  verifyCode: async (payload: {
    correo: string;
    codigo: string;
  }): Promise<void> => {
    await api.post("/auth/validar", payload);
  },

  resetPassword: async (payload: {
    nuevoPassword: string;
    confirmarPassword: string;
    correo: string;
  }): Promise<void> => {
    await api.post("auth/updatePassword", payload);
  },
};
