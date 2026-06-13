import { z } from 'zod';

/** Schema del formulario de login (correo + password). */
export const loginContextSchema = z.object({
  correo: z
    .email('Ingresa un correo valido'),
  password: z
    .string()
    .trim()
    .min(1, 'La contraseña es obligatoria')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginContext = z.infer<typeof loginContextSchema>;

/** Schema del formulario de login con email (React app). */
export const loginSchema = z.object({
  email:    z.email('Ingresa un correo válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Schema del formulario de registro. */
export const registerSchema = z.object({
  email:    z.string().email('Ingresa un correo válido'),
  username: z.string().min(3, 'Mínimo 3 caracteres'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Schemas de validación de la respuesta del servidor. */
export const authUserSchema = z.object({
  id:       z.string(),
  username: z.string(),
  email:    z.string().email(),
  role:     z.string(),
});

export const loginResponseSchema = z.object({
  user:  authUserSchema,
  token: z.string(),
});

export type LoginRespon = z.infer<typeof loginResponseSchema>;

