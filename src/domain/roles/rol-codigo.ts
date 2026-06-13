export const RolCodigo = {
  ADMIN: "ADMIN",
  CLIENTE: "ROL004",
  VENDEDOR: "VENDEDOR",
} as const;

export type RolCodigoType = (typeof RolCodigo)[keyof typeof RolCodigo]