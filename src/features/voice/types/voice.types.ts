/**
 * Voice navigation type definitions.
 * Uses string unions instead of enums for erasableSyntaxOnly compatibility.
 */

/** Possible states of the voice recognition system. */
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

/** A voice command pattern with associated action. */
export interface CommandPattern {
  patterns: string[];
  /** Action handler. Receives the raw transcript for dynamic query extraction. */
  action: (transcript?: string) => void;
  scope?: string;
}

/** Options for registering a voice command. */
export interface UseVoiceCommandOptions {
  patterns: string[];
  /** Action handler. Receives the raw transcript for dynamic query extraction. */
  action: (transcript?: string) => void;
  scope?: string;
}

/** A single command entry for display in the hint overlay. */
export interface VoiceCommandEntry {
  pattern: string;
  scope?: string;
}

/** Value exposed by VoiceProvider through React context. */
export interface VoiceProviderValue {
  state: VoiceState;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  lastTranscript: string | null;
  registerCommand: (options: UseVoiceCommandOptions) => () => void;
  /** Returns a snapshot of all currently registered commands. */
  getCommands: () => VoiceCommandEntry[];
  /** Whether the command hint overlay is visible. */
  commandHintVisible: boolean;
  /** Show the command hint overlay. */
  showCommandHint: () => void;
  /** Hide the command hint overlay. */
  hideCommandHint: () => void;
}

/** Single entry in the command registry. */
export interface CommandRegistryEntry {
  pattern: string;
  /** Action handler. Receives the raw transcript for dynamic query extraction. */
  action: (transcript?: string) => void;
  scope?: string;
}

/** Registry keyed by normalized pattern string. */
export type CommandRegistry = Map<string, CommandRegistryEntry[]>;