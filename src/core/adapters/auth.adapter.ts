import type { AuthUser, LoginResponse } from '@/domain/auth';
import { type RolCodigoType } from '@/domain/roles';

// ---------------------------------------------------------------------------
// DTOs — forma exacta que envía y recibe el backend
// ---------------------------------------------------------------------------
export interface LoginRequestDTO {
  correo: string;
  password: string;
}

export interface RegisterRequestDTO {
  email: string;
  username: string;
  password: string;
}

/** Respuesta del backend en POST auth/login */
export interface LoginResponseDTO {
  token: string;
  usuario: string;
  usuarioId: string;
  nombre: string;
  rolCodigo: string;
  correo: string | null;
}

export type RegisterResponseDTO = LoginResponseDTO;

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------
const toAuthUser = (dto: LoginResponseDTO): AuthUser => ({
  id: dto.usuarioId,
  username: dto.usuario,
  nombre: dto.nombre,
  role: dto.rolCodigo as RolCodigoType,
  rolNombre: dto.rolCodigo,
});

export const authAdapter = {
  fromLoginDTO(dto: LoginResponseDTO): LoginResponse {
    return {
      token: dto.token,
      user: toAuthUser(dto),
    };
  },

  fromRegisterDTO(dto: RegisterResponseDTO): LoginResponse {
    return {
      token: dto.token,
      user: toAuthUser(dto),
    };
  },
};
