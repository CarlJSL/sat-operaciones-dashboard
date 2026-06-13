import { HttpBase } from "@/core/lib/http-base";
import type { Rol, RolFiltro } from "@/domain/roles/rol";
import type { RolCombo } from "@/domain/roles/rol";

class RolService extends HttpBase<Rol, RolFiltro, RolCombo> {
  constructor() {
    super("/rol");
  }
}

export const rolService = new RolService();
