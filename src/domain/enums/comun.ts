export const MetodoPago = {
  Tarjeta: '01',
  Monedero: '02',
} as const;

export type MetodoPagoType = (typeof MetodoPago)[keyof typeof MetodoPago];

export const TipoComprobante = {
  Factura: 'FA',
  Boleta: 'BO',
} as const;

export type TipoComprobanteType = (typeof TipoComprobante)[keyof typeof TipoComprobante];

export const TipoDocumento = {
  DNI: '01',
  Pasaporte: '02',
  CarnetExtranjeria: '03',
  RUC: '04',
  PartidaNacimiento: '05',
} as const;

export type TipoDocumentoType = (typeof TipoDocumento)[keyof typeof TipoDocumento];
