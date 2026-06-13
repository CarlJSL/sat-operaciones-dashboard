export interface IResponseElement<T> {
  elements: T[];
  list: T[];
  limit: number;
  sort: string;
  start: number;
  totalCount: number;
}

export interface IResponseMessage {
  codigo: string;
  mensaje: string;
  id?: string;
}

export interface IResponseFile {
  archivo?: string;
  contentType?: string;
  extension?: string;
  fileBase64?: string;
  fileContent?: string;
  nombre?: string;
  tipoContenido?: string;
}
