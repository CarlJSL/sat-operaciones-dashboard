/**
 * Modelos de control de acceso por rol.
 * Definen qué menús, botones y perfiles puede ver/usar cada rol.
 */

export class Access {
  rolId?: string;
  menuMaestroId?: string;
  habilitado?: boolean;

  accesoMenuResponse?: AccessMenuResponse[];
  accesoPerfil?: AccessProfile[];

  menuMaestroRequest?: MenuMaestroRequest[];
}

export interface AccesosDeMenu {
  menusConfig?: MenusConfig[];
}

export interface MenusConfig {
  menuRolId: string;
  nombre: string;
  menuMaestroId: string;
  rolId: string;
  habilitado: boolean;
  subMenus?: SubMenu[];
}

export interface SubMenu {
  menuRolId: string;
  nombre: string;
  menuMaestroId: string;
  habilitado: boolean;
}

export interface MenuMaestroRequest {
  menuMaestroId: string;
  habilitado: boolean;
}

export interface AccessMenuResponse {
  accesoMenu: AccessMenu[];
}

export interface AccessMenu {
  menuMaestroId: string;
  nombreMenuMaestro: string;
  descripcionMenuMaestro: string;
  opcionBoton: AccessOptionButton[];
  habilitado: boolean;
}

export interface AccessOptionButton {
  botonId: string;
  codigoBoton: string;
  habilitado: boolean;
  nombreBoton: string;
  descripcion: string;
  menuMaestroId: string;
}

export interface AccessProfile {
  habilitado: boolean;
  menuOpcionId: string;
}
