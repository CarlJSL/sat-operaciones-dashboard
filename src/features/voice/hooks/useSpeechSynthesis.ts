/**
 * React hook wrapping the Web SpeechSynthesis API.
 * Provides speak/cancel with es-ES voice selection and
 * toast fallback for mute/error scenarios.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

/**
 * Select the best es-ES voice available.
 * Prefers female es-ES voices, falls back to any es voice, then default.
 */
function getSpanishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const esESFemale = voices.find(
    v => v.lang === 'es-ES' && /female|woman|mujer/i.test(v.name),
  );
  if (esESFemale) return esESFemale;

  const esES = voices.find(v => v.lang === 'es-ES');
  if (esES) return esES;

  const es = voices.find(v => v.lang.startsWith('es'));
  if (es) return es;

  return null;
}

/**
 * Hook providing SpeechSynthesis lifecycle management.
 * Queues utterances to avoid overlapping speech.
 * Falls back to toast on mute or speak errors.
 */
export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const queueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);
  const processNextRef = useRef<() => void>(() => {});
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Set up the recursive queue processor in an effect to avoid
  // assigning refs during render (react-hooks/refs rule).
  useEffect(() => {
    processNextRef.current = () => {
      if (speakingRef.current) return;
      if (queueRef.current.length === 0) {
        setIsSpeaking(false);
        return;
      }

      const text = queueRef.current.shift()!;
      speakingRef.current = true;
      setIsSpeaking(true);

      if (!isSupported) {
        toast.info(text);
        speakingRef.current = false;
        processNextRef.current();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';

      const voices = window.speechSynthesis.getVoices();
      const voice = getSpanishVoice(voices);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        speakingRef.current = false;
        processNextRef.current();
      };

      utterance.onerror = () => {
        speakingRef.current = false;
        toast.info(text);
        processNextRef.current();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        speakingRef.current = false;
        setIsSpeaking(false);
        toast.info(text);
      }
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) {
        toast.info(text);
        return;
      }
      queueRef.current.push(text);
      processNextRef.current();
    },
    [isSupported],
  );

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    queueRef.current = [];
    speakingRef.current = false;
    setIsSpeaking(false);
  }, [isSupported]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
  };
}