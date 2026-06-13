import type { RolCodigoType } from '@/domain/roles';

/** Modelo de usuario autenticado que usa la app internamente (post-login). */

export interface AuthUser {
  id: string;
  username: string;
  nombre: string;
  role: RolCodigoType;
  rolNombre: string;
}
