/**
 * Command matching engine: normalization, synonym expansion,
 * exact match, and fuzzy Levenshtein matching with conflict resolution.
 */
import { normalizeToCanonical, expandSynonyms } from './vocabulary';
import type { CommandRegistry, CommandRegistryEntry } from '../types/voice.types';

/**
 * Normalize a raw transcript: lowercase, strip accents, trim whitespace.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Compute Levenshtein distance between two strings.
 * Inline implementation (~30 lines, zero external dependencies).
 * Uses single-array space optimization.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  if (m === 0) return n;
  if (n === 0) return m;

  const dp = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) {
    dp[j] = j;
  }

  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;

    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
      }
      prev = temp;
    }
  }

  return dp[n];
}

/**
 * Match a raw voice transcript against the command registry.
 *
 * Algorithm:
 * 1. Normalize transcript (lowercase, strip accents, trim)
 * 2. Expand synonyms (replace words with canonical forms)
 * 3. Try exact match for each alternative
 * 4. If no exact match, try fuzzy Levenshtein (≤ 2, patterns with ≥ 4-char words)
 * 5. Conflict resolution: exact > shorter distance > longer pattern > registration order
 */
export function matchCommand(
  rawTranscript: string,
  registry: CommandRegistry,
): CommandRegistryEntry | null {
  const normalized = normalize(rawTranscript);
  if (!normalized) return null;

  // Step 1: Expand synonyms to generate alternative transcripts
  const alternatives = expandSynonyms(normalized);

  // Step 2: Exact match (check all alternatives first, then canonical)
  for (const alt of alternatives) {
    const entries = registry.get(alt);
    if (entries && entries.length > 0) {
      return entries[0];
    }
  }

  // Also try the pure canonical form (in case it differs from synonym expansions)
  const canonical = normalizeToCanonical(normalized);
  if (!alternatives.includes(canonical)) {
    const entries = registry.get(canonical);
    if (entries && entries.length > 0) {
      return entries[0];
    }
  }

  // Step 3: Prefix match — transcript starts with a registered pattern.
  // Enables "buscar CP155801" to match pattern "buscar".
  // Longer prefix wins to disambiguate "buscar dni" vs "buscar".
  const prefixMatches: Array<{
    entry: CommandRegistryEntry;
    patternLength: number;
  }> = [];

  const allCandidates = new Set([normalized, ...alternatives, canonical]);
  for (const candidate of allCandidates) {
    for (const [pattern, entries] of registry) {
      if (entries.length === 0) continue;
      // Exact prefix: candidate starts with pattern followed by a space (or equals pattern)
      // The candidate "buscar cp155801" starts with pattern "buscar" + " "
      if (candidate === pattern || candidate.startsWith(pattern + ' ')) {
        prefixMatches.push({
          entry: entries[0],
          patternLength: pattern.length,
        });
      }
    }
  }

  if (prefixMatches.length > 0) {
    // De-duplicate by entry reference and resolve conflicts: longest prefix wins
    const seen = new Set<CommandRegistryEntry>();
    const unique: typeof prefixMatches = [];
    for (const m of prefixMatches) {
      if (!seen.has(m.entry)) {
        seen.add(m.entry);
        unique.push(m);
      }
    }
    unique.sort((a, b) => b.patternLength - a.patternLength);
    return unique[0].entry;
  }

  // Step 4: Fuzzy match with Levenshtein distance ≤ 2
  const fuzzyMatches: Array<{
    entry: CommandRegistryEntry;
    distance: number;
    patternLength: number;
  }> = [];

  for (const [pattern, entries] of registry) {
    // Skip patterns where all words are < 4 chars to avoid noise matches
    const words = pattern.split(/\s+/);
    const hasLongWord = words.some(w => w.length >= 4);
    if (!hasLongWord) continue;

    if (entries.length === 0) continue;

    for (const alt of alternatives) {
      const dist = levenshtein(alt, pattern);
      if (dist > 0 && dist <= 2) {
        fuzzyMatches.push({
          entry: entries[0],
          distance: dist,
          patternLength: pattern.length,
        });
      }
    }
  }

  if (fuzzyMatches.length === 0) return null;

  // Step 4: Conflict resolution
  // Priority: shorter distance → longer pattern → first registered (stable sort)
  fuzzyMatches.sort((a, b) => {
    if (a.distance !== b.distance) return a.distance - b.distance;
    if (b.patternLength !== a.patternLength) return b.patternLength - a.patternLength;
    return 0;
  });

  return fuzzyMatches[0].entry;
}