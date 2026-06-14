/**
 * React context for voice navigation.
 * Provides VoiceProviderValue to all children inside HashRouter.
 */
import { createContext, useContext } from 'react';
import type { VoiceProviderValue } from '../types/voice.types';

/**
 * Context holding the voice navigation state and controls.
 * Throws if used outside of VoiceProvider.
 */
export const VoiceContext = createContext<VoiceProviderValue | null>(null);

/**
 * Hook to access the voice navigation context.
 * Must be used within a VoiceProvider (which must be inside HashRouter).
 */
export function useVoiceContext(): VoiceProviderValue {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return context;
}