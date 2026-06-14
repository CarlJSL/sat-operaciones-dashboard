/**
 * React hook wrapping the Web SpeechRecognition API.
 * Handles browser compatibility, lifecycle, and event delegation.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

/** Configuration for the SpeechRecognition instance. */
interface UseSpeechRecognitionOptions {
  onResult: (transcript: string) => void;
  onError: (errorType: string, errorMessage: string) => void;
  onEnd?: () => void;
}

/** Return type of the useSpeechRecognition hook. */
interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

/**
 * Get the SpeechRecognition constructor, accounting for browser prefixes.
 */
function getSpeechRecognitionAPI(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/**
 * Hook providing SpeechRecognition lifecycle management.
 * Creates a single instance and delegates events to callbacks.
 */
export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions,
): UseSpeechRecognitionReturn {
  const { onResult, onError, onEnd } = options;
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const onEndRef = useRef(onEnd);

  // Keep callback refs current without re-creating the recognition instance
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const isSupported = typeof window !== 'undefined' && getSpeechRecognitionAPI() !== null;

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) {
        onResultRef.current(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      onErrorRef.current(event.error, event.message ?? '');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      onEndRef.current?.();
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // Already started or not ready — ignore
    }
  }, []);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    try {
      recognition.stop();
    } catch {
      // Already stopped — ignore
    }
    setIsListening(false);
  }, []);

  return {
    isSupported,
    isListening,
    startListening,
    stopListening,
  };
}