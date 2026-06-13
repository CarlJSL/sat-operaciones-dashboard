import { z } from 'zod';

// ---------------------------------------------------------------------------
// Validación de variables de entorno al arrancar.
// Si alguna variable crítica falta, la app falla rápido con un error claro
// en lugar de romperse silenciosamente en runtime.
// ---------------------------------------------------------------------------
const envSchema = z.object({
  VITE_VERSION: z.string().min(1, 'VITE_VERSION es requerido'),
  VITE_CREDENTIALS_KEY: z.string().min(1, 'VITE_CREDENTIALS_KEY es requerido'),
  VITE_BASE_URL: z.string().min(1, 'VITE_BASE_URL es requerido'),
  // Opcionales con defaults seguros
  VITE_PRODUCTION: z.string().optional().default('false'),
  VITE_PATH_PARAMS_KEY: z.string().optional().default(''),
  VITE_OAUTH_STORAGE_KEY: z.string().optional().default(''),
  VITE_MOCK_AUTH: z.string().optional().default('false'),
  VITE_MOCK_MENU: z.string().optional().default('false'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`[ENV] Variables de entorno faltantes o inválidas:\n${issues}\n\nRevisa tu archivo .env`);
}

const env = parsed.data;

export const environment = {
  version: env.VITE_VERSION,
  production: env.VITE_PRODUCTION === 'true',
  credentialsKey: env.VITE_CREDENTIALS_KEY,
  pathParamsKey: env.VITE_PATH_PARAMS_KEY,
  oauthStorageKey: env.VITE_OAUTH_STORAGE_KEY,
  baseUrl: env.VITE_BASE_URL,
  mockAuth: env.VITE_MOCK_AUTH === 'true',
  mockMenu: env.VITE_MOCK_MENU === 'true',
};
