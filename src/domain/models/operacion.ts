import { BaseFiltro } from "./config/base-filtro";
import type { ICombo } from "./config/combo";

export interface Operacion {
  operacionId: number;
  usuarioId: number;
  cuentaOrigenId: number;
  cuentaDestinoId: number;
  numeroCuentaDestino: string;
  cciCuentaDestino: string;
  bancoCuentaDestino: string;
  tipoCambioId: number;
  codigo: string;
  origenCodigo: string;
  origenNombre: string;
  fechaRegistro: string;
  fechaFinalizacion: string | null;
  fechaCancelacion: string | null;
  tipoOperacionCodigo: string;
  tipoOperacionNombre: string;
  montoOrigen: number;
  montoDestino: number;
  tasaAplicada: number;
  estadoCodigo: string;
  estadoNombre: string;
  clienteNombreCompleto: string;
  clienteCorreo: string;
  clienteTipoDocumento: string;
  clienteDocumento: string;
  clientePep: boolean;
}

export interface OperacionCombo {
  tiposOperacion: ICombo |null;
  estadosOperacion:ICombo|null;
  origenesOperacion: ICombo|null;
}

export interface OperacionVerificarAbonoRequest {
  operacionId: number;
  accion: string;
  motivoCodigo: string;
  motivoObservacion: string;
  comentario: string;
}

export class OperacionFiltro extends BaseFiltro implements Partial<Operacion> {
  codigo!: string; 
  fechaInicio!: string;
  fechaFin!: string;
  origenCodigo!: string;
  estadoCodigo!: string;
}

export interface OperacionInitItem {
  id: number;
  codigo: string;
  nombre: string;
}

export interface OperacionInitFormResponse {
  montoMinimo: number;
  montoMaximo: number;
  umbral: number;
  margenGanancia: number;
  temporizador: number;
  tiposOperacion: ICombo | null;
  origenesFondo: ICombo | null;
  estadosOperacion?: ICombo | null;
  motivosObservacion?: ICombo | null;
  motivosRechazo?: ICombo | null;
  accionesVerificacion?: ICombo | null;
}


export interface OperacionCreateRequest {
  cuentaOrigenId: number;
  cuentaDestinoId: number;
  tipoCambioId: number;
  tipoOperacionCodigo: string;
  origenCodigo: string;
  montoOrigen: number;
  ocupacion: string;
  origenFondoCodigo: string;
  ofDescripcion: string;
}
