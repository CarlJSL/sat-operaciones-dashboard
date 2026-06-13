import type { AuthUser } from "@/domain/auth";
import { RolCodigo } from "@/domain/roles";
import { useAuthStore } from "@/features/auth/store/authStore";

const MOCK_USER: AuthUser = {
  id: "mock-user-1",
  username: "mock.admin",
  nombre: "Usuario Mock",
  role: RolCodigo.ADMIN,
  rolNombre: "Administrador",
};

export function enableMockAuth() {
  if (import.meta.env.VITE_MOCK_AUTH !== "true") {
    return;
  }

  const { isAuthenticated, setAuth } = useAuthStore.getState();
  if (!isAuthenticated) {
    setAuth(MOCK_USER, "mock-token");
  }
}
