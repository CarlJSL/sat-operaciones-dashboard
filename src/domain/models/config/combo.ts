export interface ICombo {
  list: IComboItem[];
  size: number;
}

export interface IComboItem {
  id?: string;
  codigo?: string;
  nombre?: string;
  descripcion?: string;
}
