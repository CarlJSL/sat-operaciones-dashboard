import { BaseFiltro } from './config/base-filtro';

export interface Catalogo {
  catalogoId: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  orden: number;
  referenciaCodigo: string;
  valor1: string;
  valor2: string;
  prefijo: string;
  seleccionado: boolean;
  habilitado: boolean | string;
}

export class CatalogoFiltro extends BaseFiltro implements Partial<Catalogo> {
  codigo!: string;
  nombre!: string;
  referenciaCodigo!: string;
  prefijo!: string;
  filtro!: string;
}
