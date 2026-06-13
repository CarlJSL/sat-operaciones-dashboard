import { HttpBase } from "@/core/lib/http-base";
import {
  CatalogoFiltro,
  type Catalogo,
  type PaginatedResponse,
} from "@/domain/models";
import { api } from "@/core/lib/api";

class CatalogoService extends HttpBase<Catalogo, CatalogoFiltro> {
  constructor() {
    super("/catalogo");
  }

  findItem(body: CatalogoFiltro): Promise<PaginatedResponse<Catalogo>> {
    return api
      .post<PaginatedResponse<Catalogo>>(`${this.baseUrl}/findItem`, body)
      .then((r) => r.data);
  }
}

export const catalogoService = new CatalogoService();
