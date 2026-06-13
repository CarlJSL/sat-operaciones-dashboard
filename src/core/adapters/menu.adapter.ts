import type { Menu } from '@/domain/roles';

export interface MenuItemDTO {
  children?: MenuItemDTO[];
  icono: string | null;
  text: string;
  to?: string | null;
  title?: string;
  menuRolId: string;
}

export interface LoadMenuResponseDTO {
  menu: MenuItemDTO[];
}

const toMenu = (dto: MenuItemDTO): Menu => ({
  icono: dto.icono || '', 
  text: dto.text,
  to: dto.to,
  title: dto.title,
  menuRolId: dto.menuRolId,
  children: dto.children?.map(toMenu),
});

export const menuAdapter = {
  fromMenuListDTO: (dtos: MenuItemDTO[]): Menu[] => dtos.map(toMenu),
};
