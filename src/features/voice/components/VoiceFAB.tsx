/**
 * VoiceFAB — Floating Action Button for voice navigation.
 *
 * Push-to-talk: hold to listen, release to stop.
 * Keyboard: Ctrl+Shift+V toggles listening.
 * Hides entirely on browsers without SpeechRecognition support.
 *
 * Visual states:
 *   idle       → platform-blue with glow pulse ring + label "Hablar"
 *   listening  → red pulse ring + strong ring + label "Escuchando…"
 *   processing → yellow spinner + label "Pensando…"
 *   error      → red static + label "Error"
 *   speaking   → green pulse + label "Respondiendo"
 */
import { useEffect, useCallback, useRef } from 'react';
import { Mic, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { useVoiceContext } from '../context/voiceContext';

const PRIVACY_KEY = 'voice-privacy-accepted';
const PRIVACY_EVENT = 'voice:show-privacy-banner';

function requestPrivacyBanner() {
  window.dispatchEvent(new CustomEvent(PRIVACY_EVENT));
}

export function VoiceFAB() {
  const { state, startListening, stopListening, isSupported } = useVoiceContext();
  const holdRef = useRef(false);

  const handlePressStart = useCallback(() => {
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

  if (!isSupported) return null;

  // ---------- visual config per state ----------
  const getIcon = () => {
    const size = 'size-7';
    switch (state) {
      case 'listening':
        return <Mic className={`${size} text-white`} />;
      case 'processing':
        return <Loader2 className={`${size} text-white animate-spin`} />;
      case 'speaking':
        return <Volume2 className={`${size} text-white`} />;
      case 'error':
        return <AlertCircle className={`${size} text-white`} />;
      default:
        return <Mic className={`${size} text-white`} />;
    }
  };

  const getLabel = () => {
    switch (state) {
      case 'listening': return 'Escuchando…';
      case 'processing': return 'Pensando…';
      case 'speaking': return 'Respondiendo';
      case 'error': return 'Error';
      default: return 'Hablar';
    }
  };

  const getButtonClasses = () => {
    const base =
      'relative flex items-center justify-center rounded-full select-none touch-none transition-all duration-300 focus:outline-none cursor-pointer';

    const sizeClass = 'size-16';

    const stateConfig: Record<string, { bg: string; ring: string; pulse: boolean }> = {
      idle: {
        bg: 'bg-platform-blue shadow-xl shadow-black/20 hover:bg-platform-blue/90 hover:scale-110 border-[3px] border-white/90',
        ring: 'ring-2 ring-white/40',
        pulse: true,
      },
      listening: {
        bg: 'bg-red-600 shadow-xl shadow-red-600/40 scale-110 border-[3px] border-white/90',
        ring: 'ring-4 ring-red-400/60',
        pulse: true,
      },
      processing: {
        bg: 'bg-amber-500 shadow-xl shadow-amber-500/30 border-[3px] border-white/90',
        ring: 'ring-2 ring-amber-300/40',
        pulse: false,
      },
      speaking: {
        bg: 'bg-emerald-500 shadow-xl shadow-emerald-500/30 border-[3px] border-white/90',
        ring: 'ring-2 ring-emerald-300/40',
        pulse: true,
      },
      error: {
        bg: 'bg-red-600 shadow-xl shadow-red-600/40 border-[3px] border-white/90',
        ring: 'ring-4 ring-red-400/50',
        pulse: false,
      },
    };

    const config = stateConfig[state] ?? stateConfig.idle;
    const pulseClass = config.pulse ? 'animate-pulse' : '';
    return `${base} ${sizeClass} ${config.bg} ${config.ring} ${pulseClass}`;
  };

  const label = getLabel();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2">
      {/* Floating label — always visible */}
      <span className={`
        rounded-full px-4 py-1.5 text-sm font-black shadow-lg transition-all duration-300 border-2 border-white/80
        ${state === 'idle'
          ? 'bg-platform-blue text-white'
          : state === 'listening'
            ? 'bg-red-600 text-white animate-pulse'
            : state === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-800 text-white'}
      `}>
        {label}
      </span>

      {/* Main button with glow ring */}
      <div className="relative">
        {/* Outer glow ring (idle only) */}
        {state === 'idle' && (
          <div className="absolute inset-0 rounded-full bg-platform-blue/20 animate-ping scale-150" />
        )}

        <button
          type="button"
          className={getButtonClasses()}
          onMouseDown={handleMouseDown}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onTouchCancel={handlePressEnd}
          aria-label={label}
        >
          {getIcon()}

          {/* Listening ring animation */}
          {state === 'listening' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75" />
              <div className="absolute -inset-2 rounded-full border-2 border-red-400/30 animate-pulse" />
            </>
          )}

          {/* Processing dots */}
          {state === 'processing' && (
            <div className="absolute -inset-1 rounded-full border-2 border-dashed border-amber-300 animate-spin" />
          )}
        </button>
      </div>
    </div>
  );
}
