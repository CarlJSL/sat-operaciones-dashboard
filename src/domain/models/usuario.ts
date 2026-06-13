import { BaseFiltro } from "./config/base-filtro";
import type { ICombo } from "./config/combo";

export interface Usuario {
  apellidos: string;
  combo: UsuarioCombo;
  seleccionado: boolean;
  numeroDocumento: string;
  password: string;
  turnoId: string;
  turno: string;
  tipoDocumento: string;
  cargo: string;
  jornada: string;
  jornadaCodigo: string;
  salarioHora: number;
  sueldoPorHora: number;
  salario: number;
  fechaUltimaMarcacion: string;
  fechaInicio: string;
  checkEdicionInicio: boolean;
  cargoCodigo: string;
  entidadBancariaCodigo: string;
  entidadBancaria: string;
  numeroCuenta: string;
  cci: string;
  nombreCompleto: string;
  habilitado: boolean;
  rol: string;
  rolNombre: string;
  estadoNombre:string;
  rolCodigo: string;
  estadoCodigo: string;
  estado: string;
  telefono: string;
  fechaRegistro: string;
  clienteId: string;
  usuarioId: string;
  rolId: string;
  empresaId: string;
  contratistaId: string;
  sucursalId: string;
  tipoDocumentoCodigo: string;
  documento: string;
  usuario: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  correo: string;
  celular: string;
  fechaConsulta: string;
  sede: string;
  sedeCodigo: string;
  unidad: string;
  unidadCodigo: string;
  tipoEmpleado: string;
}

export interface UsuarioCombo {
  tipoDocumento: ICombo | null;
  roles: ICombo | null;
  empresa: ICombo | null;
  estados: ICombo | null;
  sucursal: ICombo | null;
}

export class UsuarioFiltro extends BaseFiltro implements Partial<Usuario> {
  estadoCodigo!: string;
  nombreCompleto!: string;
  numeroDocumento!: string;
  rolId!: string;
  sucursalId!: string;
  rolNombre!: string;
  tiendaId!: string;
  usuario!: string;
  correo!: string;
  tipoDocumentoCodigo!: string;
}

export interface UsuarioFormCombo {
  combo:{
  tipoDocumento: ICombo | null;
  estado: ICombo | null;
  rol: ICombo | null;
  empresa: ICombo | null;
  turno: ICombo | null;
  local: ICombo | null;
  }
}
