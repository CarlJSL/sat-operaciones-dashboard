import { BaseFiltro } from './config/base-filtro';
import type { ICombo } from './config/combo';

export class DashboardFiltro {
  desde!: string | null;
  hasta!: string | null;
  turnoIds!: string[];
  usuarioIds!: string[];
  estadoCodigos!: string[];
  usuariosIds!: string[];
  clientes!: string[];
  proyectos!: string[];
  prospectos!: string[];
  proyectoId!: string[];
  clienteId!: string | null;
  anioCodigo!: string | null;
}

export class TablaFiltro extends BaseFiltro {
  desde!: string | null;
  hasta!: string | null;
  turnoIds!: string[];
  usuarioIds!: string[];
  estadoCodigos!: string[];
}

export interface Dashboard {
  labels: string[];
  datasets: Dataset[];
}

export interface Dataset {
  label: string;
  name: string;
  data: number[];
}

export interface DashboardCombo {
  estado: ICombo | null;
  usuario: ICombo | null;
  proyecto: ICombo | null;
  prospecto: ICombo | null;
  cliente: ICombo | null;
  anio: ICombo | null;
}

export interface DashboardContador {
  diaDisponible: number;
  diaSolicitado: number;
  diaTomado: number;
}
