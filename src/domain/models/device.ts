export interface Device {
  coordenada: Coordenada | null;
  host: string | null;
  browser: string | null;
  dispositivo: string | null;
  so: string | null;
}

export interface Coordenada {
  latitud: string;
  longitud: string;
}
