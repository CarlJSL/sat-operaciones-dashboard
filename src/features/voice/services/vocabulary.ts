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
  papeleta: ['papeleta', 'multa', 'infraccion'],
  placa: ['placa', 'chapa'],
  brevete: ['brevete', 'licencia'],
  dni: ['dni', 'documento'],
  consultar: ['consultar', 'ver', 'revisar', 'buscar'],
  pagar: ['pagar', 'cancelar', 'abonar'],
  reclamo: ['reclamo', 'apelacion', 'impugnar'],
  volver: ['volver', 'atras', 'retroceder', 'regresar'],
  inicio: ['inicio', 'principal', 'home', 'plataforma'],
  salir: ['salir', 'cerrar sesion', 'logout'],
  ayuda: ['ayuda', 'asistencia', 'soporte', 'asesor'],
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