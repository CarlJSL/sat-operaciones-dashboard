/**
 * Synonym vocabulary for voice command normalization.
 *
 * Includes formal Spanish and Peruvian slang per product decision #2,
 * enabling drivers to use their natural vocabulary.
 *
 * All words stored in normalized form (lowercase, accents stripped)
 * because the command matcher normalizes transcripts before matching.
 */
export const SYNONYM_GROUPS: Record<string, string[]> = {
  // Documentos e infracciones
  papeleta: ['papeleta', 'multa', 'infraccion', 'parte', 'papeletas', 'multas', 'infracciones'],
  placa: ['placa', 'chapa', 'matricula', 'placa de rodaje'],
  brevete: ['brevete', 'licencia', 'licencia de conducir', 'carnet'],
  dni: ['dni', 'documento', 'cedula', 'identificacion', 'numero de documento'],
  
  // Acciones de búsqueda
  consultar: ['consultar', 'ver', 'revisar', 'buscar', 'mirar', 'mostrar', 'checar', 'chequear', 'fijate', 'averiguar', 'ubicar'],
  
  // Acciones de pago
  pagar: ['pagar', 'cancelar', 'abonar', 'liquidar', 'saldar', 'pagar la multa', 'ponerme al dia'],
  
  // Acciones de reclamo
  reclamo: ['reclamo', 'apelacion', 'impugnar', 'queja', 'descargo', 'reclamar', 'apelar', 'quejarme', 'contradecir'],
  
  // Acciones de impresión
  imprimir: ['imprimir', 'imprimir constancia', 'sacar copia', 'imprimir documento', 'constancia'],
  
  // Acciones de descarga
  descargar: ['descargar', 'bajar', 'descargar expediente', 'bajar archivo', 'obtener copia'],
  
  // Navegación
  volver: ['volver', 'atras', 'retroceder', 'regresar', 'devolverme', 'regresame', 'para atras'],
  inicio: ['inicio', 'principal', 'home', 'plataforma', 'pagina principal', 'pantalla principal', 'menu', 'comienzo'],
  
  // Sesión
  salir: ['salir', 'cerrar sesion', 'logout', 'desconectarme', 'irme', 'terminar'],
  
  // Ayuda
  ayuda: ['ayuda', 'asistencia', 'soporte', 'asesor', 'chat', 'hablar con alguien', 'contactar', 'atencion', 'auxilio', 'orientacion'],
  
  // Comunicación
  whatsapp: ['whatsapp', 'chat', 'mensaje', 'escribir', 'contactar', 'hablar', 'conversar', 'consultar al asesor', 'comunicarme'],
  
  // Foto / evidencia
  foto: ['foto', 'imagen', 'evidencia', 'prueba', 'captura', 'registro fotografico', 'mostrar foto'],
  
  // Registro / notificaciones
  notificame: ['notificame', 'registrarme', 'alertas', 'notificaciones', 'avisos', 'suscribirme', 'darme de alta', 'inscribirme'],
  
  // Búsqueda de otra papeleta
  otra: ['otra', 'nueva busqueda', 'buscar otra', 'otra papeleta', 'nueva consulta', 'siguiente'],
  
  // Cerrar / detener
  detener: ['detener', 'parar', 'stop', 'basta', 'silencio', 'callate', 'apagar', 'terminar', 'finalizar'],
  
  // Cerrar modales
  cerrar: ['cerrar', 'ocultar', 'quitar', 'sacar', 'cerrar foto', 'cerrar ventana'],
};

/**
 * Reverse map: any synonym → its canonical (group key) form.
 * Built once at module load for O(1) lookups.
 */
const reverseMap = new Map<string, string>();
for (const [canonical, synonyms] of Object.entries(SYNONYM_GROUPS)) {
  for (const synonym of synonyms) {
    reverseMap.set(synonym, canonical);
  }
}

/**
 * Replace every word in the transcript with its canonical synonym.
 * Words not in the synonym map are left unchanged.
 */
export function normalizeToCanonical(transcript: string): string {
  return transcript
    .split(/\s+/)
    .map(word => reverseMap.get(word) ?? word)
    .join(' ');
}

/**
 * Generate alternative transcripts by replacing individual words
 * with their canonical forms. Returns the original transcript plus
 * all single-word-replacement variants and the fully-canonical form.
 */
export function expandSynonyms(transcript: string): string[] {
  const alternatives = new Set<string>();
  alternatives.add(transcript);

  const words = transcript.split(/\s+/);
  const canonical = normalizeToCanonical(transcript);
  alternatives.add(canonical);

  for (let i = 0; i < words.length; i++) {
    const canonicalWord = reverseMap.get(words[i]);
    if (canonicalWord && canonicalWord !== words[i]) {
      const expanded = [...words];
      expanded[i] = canonicalWord;
      alternatives.add(expanded.join(' '));
    }
  }

  return [...alternatives];
}