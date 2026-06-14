/**
 * VoiceFAB — Floating Action Button for voice navigation.
 *
 * Push-to-talk: hold to listen, release to stop.
 * Keyboard: Ctrl+Shift+V toggles listening.
 * Hides entirely on browsers without SpeechRecognition support.
 *
 * Visual states:
 *   idle       → primary button (dark navy)
 *   listening  → red pulse ring
 *   processing → yellow spinner
 *   error      → red static
 *   speaking   → blue pulse (soft)
 */
import { useEffect, useCallback, useRef } from 'react';
import { Mic, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { useVoiceContext } from '../context/voiceContext';

const PRIVACY_KEY = 'voice-privacy-accepted';
const PRIVACY_EVENT = 'voice:show-privacy-banner';

/** Dispatch a custom event to show the privacy banner. */
function requestPrivacyBanner() {
  window.dispatchEvent(new CustomEvent(PRIVACY_EVENT));
}

export function VoiceFAB() {
  const { state, startListening, stopListening, isSupported } = useVoiceContext();
  const holdRef = useRef(false);

  // ---------- push-to-talk ----------
  const handlePressStart = useCallback(() => {
    // Check privacy acceptance before listening
    if (!localStorage.getItem(PRIVACY_KEY)) {
      requestPrivacyBanner();
      return;
    }
    holdRef.current = true;
    startListening();
  }, [startListening]);

  const handlePressEnd = useCallback(() => {
    if (holdRef.current) {
      holdRef.current = false;
      stopListening();
    }
  }, [stopListening]);

  // Prevent text selection on long press
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handlePressStart();
  }, [handlePressStart]);

  // ---------- keyboard shortcut ----------
  useEffect(() => {
    if (!isSupported) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        if (!localStorage.getItem(PRIVACY_KEY)) {
          requestPrivacyBanner();
          return;
        }
        if (state === 'idle' || state === 'error') {
          startListening();
        } else if (state === 'listening') {
          stopListening();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSupported, state, startListening, stopListening]);

  // Hide FAB on unsupported browsers — hooks must run unconditionally above
  if (!isSupported) return null;

  // ---------- visual config per state ----------
  const getIcon = () => {
    switch (state) {
      case 'listening':
        return <Mic className="size-6 text-white" />;
      case 'processing':
        return <Loader2 className="size-6 text-white animate-spin" />;
      case 'speaking':
        return <Volume2 className="size-6 text-white" />;
      case 'error':
        return <AlertCircle className="size-6 text-white" />;
      default:
        return <Mic className="size-6 text-white" />;
    }
  };

  const getButtonClasses = () => {
    const base =
      'fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-lg select-none touch-none transition-colors duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/50';

    const sizeClass = 'size-14'; // 56px touch target

    const stateClasses: Record<string, string> = {
      idle: 'bg-primary hover:bg-primary/90',
      listening: 'bg-red-600 hover:bg-red-700 animate-pulse',
      processing: 'bg-yellow-500 hover:bg-yellow-600',
      speaking: 'bg-blue-500 hover:bg-blue-600 animate-pulse',
      error: 'bg-red-600 hover:bg-red-700',
    };

    const ringClass = state === 'listening'
      ? 'ring-4 ring-red-400/50'
      : state === 'error'
        ? 'ring-4 ring-red-400/50'
        : '';

    return `${base} ${sizeClass} ${stateClasses[state] || stateClasses.idle} ${ringClass}`;
  };

  const getAriaLabel = () => {
    switch (state) {
      case 'listening':
        return 'Escuchando… suelta para detener';
      case 'processing':
        return 'Procesando…';
      case 'speaking':
        return 'Respondiendo…';
      case 'error':
        return 'Error de voz — presiona para reintentar';
      default:
        return 'Mantén presionado para hablar';
    }
  };

  const tooltipText = state === 'idle'
    ? 'Mantén presionado para hablar (Ctrl+Shift+V)'
    : getAriaLabel();

  return (
    <div
      className="group fixed bottom-6 right-6 z-50"
      role="button"
      aria-label={getAriaLabel()}
      tabIndex={0}
    >
      {/* Tooltip */}
      <span
        className="
          pointer-events-none absolute bottom-full right-0 mb-2
          max-w-[200px] whitespace-normal rounded-md bg-foreground
          px-3 py-1.5 text-xs text-background opacity-0
          transition-opacity group-hover:opacity-100
        "
      >
        {tooltipText}
      </span>

      <button
        type="button"
        className={getButtonClasses()}
        onMouseDown={handleMouseDown}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        aria-label={getAriaLabel()}
      >
        {getIcon()}
      </button>
    </div>
  );
}