export type ReclamoMotivo =
  | 'NO_MI_VEHICULO'
  | 'FALLA_SEMAFORO'
  | 'SENIALIZACION_INADECUADA'
  | 'EMERGENCIA'
  | 'OTRO';

export const MOTIVOS_RECLAMO: Record<ReclamoMotivo, string> = {
  NO_MI_VEHICULO: 'No era mi vehículo',
  FALLA_SEMAFORO: 'Falla en el semáforo',
  SENIALIZACION_INADECUADA: 'Señalización inadecuada',
  EMERGENCIA: 'Emergencia o fuerza mayor',
  OTRO: 'Otro motivo',
};

export interface ReclamoRequest {
  papeletaId: string;
  motivo: ReclamoMotivo;
  descripcion: string;
  evidencia?: File | null;
}

export interface ReclamoResponse {
  numeroExpediente: string;
  fechaPresentacion: string;
  mensaje: string;
}
