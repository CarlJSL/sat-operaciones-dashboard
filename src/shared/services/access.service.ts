import { api } from "@/core/lib/api";
import type { IResponseMessage } from "@/domain/models";
import type { Access, AccesosDeMenu } from "@/domain/roles";

class AccessService {
  private readonly baseUrl = "/access";

  saveOrUpdateSeccion(context: Access): Promise<IResponseMessage> {
    return api
      .post<IResponseMessage>(`${this.baseUrl}/saveOrUpdateSeccion`, context)
      .then((r) => r.data);
  }

  saveOrUpdateMenuRol(context: AccesosDeMenu): Promise<IResponseMessage> {
    return api
      .post<IResponseMessage>(`${this.baseUrl}/saveOrUpdateMenuRol`, context)
      .then((r) => r.data);
  }

  getMenu(id?: number | string): Promise<AccesosDeMenu> {
    const url = id ? `${this.baseUrl}/getMenu/${id}` : `${this.baseUrl}/getMenu`;
    return api.get<AccesosDeMenu>(url).then((r) => r.data);
  }

  check(id?: number | string): Promise<AccesosDeMenu> {
    const url = id ? `${this.baseUrl}/getMenu/${id}` : `${this.baseUrl}/getMenu`;
    return api.get<AccesosDeMenu>(url).then((r) => r.data);
  }
}

export const accessService = new AccessService();
