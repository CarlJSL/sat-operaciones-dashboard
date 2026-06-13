/** Ítem de menú de navegación devuelto por el backend (ligado a rol vía menuRolId). */
export interface Menu {
  children?: Menu[];
  icono: string;
  text: string;
  to?: string | null;
  title?: string;
  menuRolId: string;
}
