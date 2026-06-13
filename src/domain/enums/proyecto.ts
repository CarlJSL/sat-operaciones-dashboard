export const ProyectoEstado = {
  EN_ESPERA:  'ESTPR001',
  EN_PROCESO: 'ESTPR002',
  EN_PAUSA:   'ESTPR003',
  FINALIZADO: 'ESTPR004',
  CANCELADO:  'ESTPR005',
  ARCHIVADO:  'ESTPR006',
} as const;

export type ProyectoEstadoType = (typeof ProyectoEstado)[keyof typeof ProyectoEstado];
