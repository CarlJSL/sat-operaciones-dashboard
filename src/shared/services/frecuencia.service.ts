import { api } from "@/core/lib/api";
import { HttpBase } from "@/core/lib/http-base";
import type { Frecuencia } from "@/domain/models/frecuencia";

class FrecuenciaService extends HttpBase<Frecuencia> {
  constructor() {
    super("/frecuencia");
  }

  load(id: string | number): Promise<any> {
    return api
      .get<any>(`${this.baseUrl}/load/${id}`)
      .then((r) => r.data);
  }

  getDetalle(id: string): Promise<Frecuencia> {
    return api
      .get<Frecuencia>(`${this.baseUrl}/get/${id}`)
      .then((r) => r.data);
  }
}

export const frecuenciaService = new FrecuenciaService();
