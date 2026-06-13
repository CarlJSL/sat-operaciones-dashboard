import type { AuthUser } from './auth-user';

/** Modelo de respuesta del servicio de login (dominio interno). */
export interface LoginResponse {
  user: AuthUser;
  token: string;
}
