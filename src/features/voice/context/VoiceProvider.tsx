/**
 * VoiceProvider — central context for voice navigation.
 *
 * Manages a single SpeechRecognition instance, command registry,
 * and the match-and-execute pipeline. Must be rendered INSIDE
 * HashRouter because it uses useNavigate for global commands.
 *
 * Architecture decisions (from design.md):
 * - React Context (not Zustand): co-located with mic lifecycle
 * - Map<string, CommandRegistryEntry[]>: O(1) exact lookup, easy iteration
 * - Levenshtein inline (~30 lines): zero external deps
 * - Spanish locale es-ES
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { VoiceState, UseVoiceCommandOptions, CommandRegistry, VoiceCommandEntry } from '../types/voice.types';
import { VoiceContext } from './voiceContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { matchCommand, normalize } from '../services/commandMatcher';
import { createRegistry, registerCommand, unregisterCommand } from '../services/commandRegistry';
import { useAuthStore } from '@/features/auth/store/authStore';

/** Debounce cooldown in ms to prevent rapid re-activation. */
const START_COOLDOWN_MS = 500;

/**
 * VoiceProvider wraps the application and provides voice navigation context.
 * Place inside HashRouter (needs useNavigate).
 */
export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<VoiceState>('idle');
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const [commandHintVisible, setCommandHintVisible] = useState(false);
  const registryRef = useRef<CommandRegistry>(createRegistry());
  const lastStartRef = useRef<number>(0);
  const stateRef = useRef<VoiceState>(state);
  const stopListeningRef = useRef<() => void>(() => {});
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Keep stateRef in sync so callbacks always read fresh state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Register built-in global commands once
  useEffect(() => {
    const registry = registryRef.current;
    const globalScope = '__global__';

    const backPatterns = ['volver', 'atras', 'retroceder', 'regresar'].map(normalize);
    const homePatterns = ['inicio', 'principal', 'home', 'plataforma'].map(normalize);
    const logoutPatterns = ['salir', 'cerrar sesion', 'logout'].map(normalize);
    const helpPatterns = ['ayuda', 'asistencia', 'que puedo decir', 'comandos'].map(normalize);
    const closeHintPatterns = ['cerrar', 'ocultar'].map(normalize);
    const stopPatterns = ['detener', 'parar', 'stop'].map(normalize);

    const backAction = () => navigate(-1);
    const homeAction = () => navigate('/inicio');
    const logoutAction = () => { clearAuth(); navigate('/login'); };
    const helpAction = () => setCommandHintVisible(true);
    const closeHintAction = () => setCommandHintVisible(false);
    const stopAction = () => stopListeningRef.current();

    registerCommand(registry, backPatterns, backAction, globalScope);
    registerCommand(registry, homePatterns, homeAction, globalScope);
    registerCommand(registry, logoutPatterns, logoutAction, globalScope);
    registerCommand(registry, helpPatterns, helpAction, globalScope);
    registerCommand(registry, closeHintPatterns, closeHintAction, globalScope);
    registerCommand(registry, stopPatterns, stopAction, globalScope);

    return () => {
      unregisterCommand(registry, backPatterns, backAction);
      unregisterCommand(registry, homePatterns, homeAction);
      unregisterCommand(registry, logoutPatterns, logoutAction);
      unregisterCommand(registry, helpPatterns, helpAction);
      unregisterCommand(registry, closeHintPatterns, closeHintAction);
      unregisterCommand(registry, stopPatterns, stopAction);
    };
  }, [navigate, clearAuth]);

  const handleResult = useCallback((transcript: string) => {
    setState('processing');
    setLastTranscript(transcript);

    const entry = matchCommand(transcript, registryRef.current);
    if (entry) {
      try {
        entry.action(transcript);
        setState('idle');
      } catch {
        setState('error');
        toast.error('Error al ejecutar el comando');
      }
    } else {
      setState('idle');
      toast.info('Comando no reconocido');
    }
  }, []);

  const handleError = useCallback((errorType: string) => {
    switch (errorType) {
      case 'not-allowed':
        setState('error');
        toast.error('Micrófono requerido para navegación por voz');
        break;
      case 'network':
        setState('error');
        toast.error('Error de conexión. Verifica tu red.');
        break;
      case 'no-speech':
        // Silent — no speech detected, return to idle
        setState('idle');
        break;
      default:
        setState('error');
        break;
    }
  }, []);

  const { isSupported, startListening: startRec, stopListening: stopRec } = useSpeechRecognition({
    onResult: handleResult,
    onError: handleError,
    onEnd: () => {
      if (stateRef.current !== 'processing') {
        setState('idle');
      }
    },
  });

  const startListening = useCallback(() => {
    // Debounce: ignore rapid re-activation
    const now = Date.now();
    if (now - lastStartRef.current < START_COOLDOWN_MS) return;
    lastStartRef.current = now;

    setState('listening');
    startRec();
  }, [startRec]);

  const stopListening = useCallback(() => {
    stopRec();
    setState('idle');
  }, [stopRec]);

  // Keep ref in sync for global commands registered before stopListening exists
  stopListeningRef.current = stopListening;

  const registerVoiceCommand = useCallback((options: UseVoiceCommandOptions): (() => void) => {
    const normalizedPatterns = options.patterns.map(p => normalize(p));
    registerCommand(registryRef.current, normalizedPatterns, options.action, options.scope);

    // Return cleanup function
    return () => {
      unregisterCommand(registryRef.current, normalizedPatterns, options.action);
    };
  }, []);

  const getCommands = useCallback((): VoiceCommandEntry[] => {
    const commands: VoiceCommandEntry[] = [];
    for (const [, entries] of registryRef.current) {
      for (const entry of entries) {
        commands.push({ pattern: entry.pattern, scope: entry.scope });
      }
    }
    return commands;
  }, []);

  const showCommandHint = useCallback(() => {
    setCommandHintVisible(true);
  }, []);

  const hideCommandHint = useCallback(() => {
    setCommandHintVisible(false);
  }, []);

  const contextValue = {
    state,
    startListening,
    stopListening,
    isSupported,
    lastTranscript,
    registerCommand: registerVoiceCommand,
    getCommands,
    commandHintVisible,
    showCommandHint,
    hideCommandHint,
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
}