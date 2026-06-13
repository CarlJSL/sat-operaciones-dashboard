import type { Menu } from "@/domain/roles";
import type { Usuario, UsuarioCombo, UsuarioFiltro, UsuarioFormCombo } from "@/domain/models/usuario";
import { api } from "@/core/lib/api";
import { HttpBase } from "@/core/lib/http-base";
import { menuAdapter, type LoadMenuResponseDTO } from "@/core/adapters/menu.adapter";
import type { IResponseMessage } from "@/domain/models";
import { MOCK_MENU } from "@/shared/mocks/menu.mock";
import { environment } from "@/core/config/environment";



class UsuarioService extends HttpBase<Usuario, UsuarioFiltro, UsuarioCombo> {
  constructor() {
    super("/usuario");
  }

  async loadMenu(): Promise<Menu[]> {
    if (environment.mockMenu) {
      return MOCK_MENU;
    }

    const { data } = await api.get<LoadMenuResponseDTO>("/usuario/loadMenu");
    return menuAdapter.fromMenuListDTO(data.menu || []);
  }

    initForm(): Promise<UsuarioFormCombo> {
      return api
        .get<UsuarioFormCombo>(`${this.baseUrl}/initForm`)
        .then((r) => r.data);
    }

  resetPassword(usuarioId: string): Promise<IResponseMessage> {
    return api
      .post<IResponseMessage>(`${this.baseUrl}/resetPassword`, {
        usuarioId,
      })
      .then((r) => r.data);
  }
}

export const usuarioService = new UsuarioService();

