export const DocumentoEstado = {
  BORRADOR:      'ESDOC001',
  REVISION_INT:  'ESDOC002',
  APROBADO_INT:  'ESDOC003',
  ENVIADO:       'ESDOC004',
  OBERVADO_CLI:  'ESDOC005',
  SUBSANADO:     'ESDOC006',
  APROBADO_CLI:  'ESDOC007',
  ARCHIVADO:     'ESDOC008',
} as const;

export type DocumentoEstadoType = (typeof DocumentoEstado)[keyof typeof DocumentoEstado];
