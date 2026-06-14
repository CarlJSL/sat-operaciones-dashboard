/**
 * Map-based command registry for O(1) exact lookups.
 * Stores patterns keyed by their normalized text, allowing
 * multiple handlers per pattern (scoped commands).
 */
import type { CommandRegistry, CommandRegistryEntry } from '../types/voice.types';

/**
 * Create a new empty command registry.
 */
export function createRegistry(): CommandRegistry {
  return new Map();
}

/**
 * Register a command with one or more patterns.
 * Each pattern creates a separate entry in the registry Map.
 */
export function registerCommand(
  registry: CommandRegistry,
  patterns: string[],
  action: (transcript?: string) => void,
  scope?: string,
): void {
  for (const pattern of patterns) {
    const entry: CommandRegistryEntry = { pattern, action, scope };
    const existing = registry.get(pattern);
    if (existing) {
      existing.push(entry);
    } else {
      registry.set(pattern, [entry]);
    }
  }
}

/**
 * Unregister a command by its patterns and action reference.
 * Removes entries whose action matches the provided reference.
 */
export function unregisterCommand(
  registry: CommandRegistry,
  patterns: string[],
  action: (transcript?: string) => void,
): void {
  for (const pattern of patterns) {
    const entries = registry.get(pattern);
    if (entries) {
      const filtered = entries.filter(e => e.action !== action);
      if (filtered.length === 0) {
        registry.delete(pattern);
      } else {
        registry.set(pattern, filtered);
      }
    }
  }
}

/**
 * Get all registered pattern strings from the registry.
 */
export function getAllPatterns(registry: CommandRegistry): string[] {
  return [...registry.keys()];
}