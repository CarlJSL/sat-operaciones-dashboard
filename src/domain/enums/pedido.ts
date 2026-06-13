export const PedidoEstado = {
  PENDIENTE:    'ESPED001',
  ASIGNADO:     'ESPED002',
  RECOGIDO:     'ESPED003',
  RECEPCIONADO: 'ESPED004',
  RUTA:         'ESPED005',
  ENTREGADO:    'ESPED006',
  LIQUIDADO:    'ESPED007',
  FINALIZADO:   'ESPED008',
  OBSERVADO:    'ESPED009',
} as const;

export type PedidoEstadoType = (typeof PedidoEstado)[keyof typeof PedidoEstado];
