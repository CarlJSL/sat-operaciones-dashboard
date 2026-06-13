import type { PaginatedResponse } from "@/domain/models/config/pagination";
import { api } from "./api";
import type { IResponseMessage } from "@/domain/models";

/**
 * Clase base genérica para servicios HTTP.
 * Proporciona operaciones CRUD estándar para cualquier entidad.
 *
 * @template DataModel   - Modelo de la entidad
 * @template FilterModel - Modelo del filtro de búsqueda (default: Partial<DataModel>)
 * @template SelectModel
 */
export class HttpBase<
  DataModel,
  FilterModel = Partial<DataModel>,
  SelectModel = Partial<DataModel>,
> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  search(context: FilterModel): Promise<PaginatedResponse<DataModel>> {
    return api
      .post<PaginatedResponse<DataModel>>(`${this.baseUrl}/search`, context)
      .then((r) => r.data);
  }

  find(context: FilterModel): Promise<PaginatedResponse<DataModel>> {
    return api
      .post<PaginatedResponse<DataModel>>(`${this.baseUrl}/find`, context)
      .then((r) => r.data);
  }

  getById(id: string | number): Promise<DataModel> {
    return api
      .get<DataModel>(`${this.baseUrl}/getById/${id}`)
      .then((r) => r.data);
  }

  get(id: string | number): Promise<DataModel> {
    return api
      .get<DataModel>(`${this.baseUrl}/get/${id}`)
      .then((r) => r.data);
  }

  init(id?: number | string): Promise<SelectModel> {
    const url = id ? `${this.baseUrl}/init/${id}` : `${this.baseUrl}/init`;

    return api.get<SelectModel>(url).then((r) => r.data);
  }

  saveOrUpdate(context: DataModel): Promise<IResponseMessage> {
    return api
      .post<IResponseMessage>(`${this.baseUrl}/saveOrUpdate`, context)
      .then((r) => r.data);
  }

  create(context: Partial<DataModel>): Promise<void> {
    return api.post<void>(`${this.baseUrl}`, context).then((r) => r.data);
  }

  update(id: string | number, context: Partial<DataModel>): Promise<void> {
    return api.put<void>(`${this.baseUrl}/${id}`, context).then((r) => r.data);
  }

  remove(id: string | number): Promise<void> {
    return api.delete<void>(`${this.baseUrl}/delete/${id}`).then((r) => r.data);
  }

  saveOrUpdateWithFile(
    context: Partial<DataModel>,
    file: File | null,
  ): Promise<void> {
    const formData = new FormData();
    formData.append("request", JSON.stringify(context));
    if (file) formData.append("file", file);

    return api
      .post<void>(`${this.baseUrl}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  }
}
