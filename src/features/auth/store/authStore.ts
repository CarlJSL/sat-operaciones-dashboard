import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser } from '@/domain/auth';

// ---------------------------------------------------------------------------
// State & Actions
// ---------------------------------------------------------------------------
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

// ---------------------------------------------------------------------------
// Store — persiste en localStorage via Zustand `persist` middleware
// ---------------------------------------------------------------------------
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        // El middleware `persist` se encarga de persistir en localStorage.
        // NO llamar localStorage.setItem aquí para evitar doble fuente de verdad.
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Sólo persistimos el estado, no las acciones
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
