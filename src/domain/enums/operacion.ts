export const OperacionEstadoCodigo = {
  PENDIENTE: "OPE001",
  EN_REVISION: "OPE002",
  EN_PROCESO: "OPE003",
  POR_AUTORIZAR: "OPE004",
  OBSERVADO: "OPE005",
  FINALIZADO: "OPE006",
  CANCELADO: "OPE007",
} as const;

export type OperacionEstadoCodigoType =
  (typeof OperacionEstadoCodigo)[keyof typeof OperacionEstadoCodigo];

export const OPERACION_ESTADO_LABELS: Record<OperacionEstadoCodigoType, string> = {
  [OperacionEstadoCodigo.PENDIENTE]: "Pendiente",
  [OperacionEstadoCodigo.EN_REVISION]: "En Revisión",
  [OperacionEstadoCodigo.EN_PROCESO]: "En Proceso",
  [OperacionEstadoCodigo.POR_AUTORIZAR]: "Por autorizar",
  [OperacionEstadoCodigo.OBSERVADO]: "Observado",
  [OperacionEstadoCodigo.FINALIZADO]: "Finalizado",
  [OperacionEstadoCodigo.CANCELADO]: "Cancelado",
};

export const puedeCancelarOperacion = (estadoCodigo?: string) =>
  !!estadoCodigo && estadoCodigo !== OperacionEstadoCodigo.FINALIZADO || 
  !!estadoCodigo && estadoCodigo !== OperacionEstadoCodigo.CANCELADO ;
 
