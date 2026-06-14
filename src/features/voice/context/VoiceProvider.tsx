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
import type { VoiceState, UseVoiceCommandOptions, CommandRegistry, VoiceCommandEntry, AICmd } from '../types/voice.types';
import { VoiceContext } from './voiceContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { matchCommand } from '../services/commandMatcher';
import { normalize } from '../services/commandMatcher';
import { createRegistry, registerCommand, unregisterCommand } from '../services/commandRegistry';
import { aiMatchCommand } from '../services/aiMatcher';
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

  /** Execute a structured AI command — maps intents to router/state actions. */
  const executeAICmd = useCallback((cmd: AICmd) => {
    switch (cmd.action) {
      case 'navigate':
        navigate(cmd.route);
        return true;
      case 'search': {
        // If query has no digits/plate pattern, it's probably noise — just navigate
        const hasIdentifier = /\d/.test(cmd.query) || /[A-Z]{2,}\d/i.test(cmd.query);
        if (hasIdentifier) {
          navigate(`/consulta-en-linea/papeletas?q=${encodeURIComponent(cmd.query)}`);
        } else {
          navigate('/consulta-en-linea/papeletas');
        }
        return true;
      }
      case 'click': {
        // Handle whatsapp globally (works from any page)
        if (cmd.target === 'whatsapp') {
          window.open('https://wa.me/51999431111', '_blank');
          return true;
        }
        // Other targets: dispatch custom event so ConsultaPapeletaPage can react
        window.dispatchEvent(new CustomEvent('voice:ai-click', { detail: { target: cmd.target } }));
        return true;
      }
      case 'global':
        switch (cmd.command) {
          case 'back': navigate(-1); return true;
          case 'home': navigate('/inicio'); return true;
          case 'logout': clearAuth(); navigate('/login'); return true;
          case 'help': setCommandHintVisible(true); return true;
          case 'stop': stopListeningRef.current(); return true;
          default: return false;
        }
      default:
        return false;
    }
  }, [navigate, clearAuth]);

  const handleResult = useCallback(async (transcript: string) => {
    setState('processing');
    setLastTranscript(transcript);

    // 1. Try local pattern matcher first (fast, offline)
    const entry = matchCommand(transcript, registryRef.current);
    if (entry) {
      try {
        entry.action(transcript);
        setState('idle');
        return;
      } catch {
        setState('error');
        toast.error('Error al ejecutar el comando');
        return;
      }
    }

    // 2. Fallback to AI (Gemini Flash) — handles natural language
    const aiCmd = await aiMatchCommand(transcript);
    if (aiCmd) {
      const ok = executeAICmd(aiCmd);
      if (ok) {
        setState('idle');
        return;
      }
    }

    // 3. Nothing matched — AI either unavailable or rate-limited
    setState('idle');
    toast.info('No entendí. ¿Podrías decirlo de otra forma?', {
      description: 'Esperá unos segundos antes de reintentar.',
    });
  }, [executeAICmd]);

  const handleError = useCallback((errorType: string, errorMessage?: string) => {
    // Log for debugging — open DevTools console to see the exact error
    console.error(`[Voice] Error: ${errorType}${errorMessage ? ` — ${errorMessage}` : ''}`);

    switch (errorType) {
      case 'not-allowed':
        setState('error');
        toast.error('Micrófono denegado. Permití el acceso en configuración del navegador.');
        break;
      case 'service-not-allowed':
        setState('error');
        toast.error('Servicio de voz bloqueado. Revisá CSP o configuración de Chrome.');
        break;
      case 'network':
        setState('error');
        toast.error('Sin conexión a Google. ¿Tenés internet? Probá en https://www.google.com');
        break;
      case 'no-speech':
        // Silent — no speech detected, return to idle
        setState('idle');
        break;
      default:
        setState('error');
        toast.error(`Error de voz: ${errorType}`);
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