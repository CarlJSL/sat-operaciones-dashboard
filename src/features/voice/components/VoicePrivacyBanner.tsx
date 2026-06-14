/**
 * VoicePrivacyBanner — one-time privacy disclosure for voice features.
 *
 * Shows when the user first activates voice, explaining that audio is
 * sent to Google for speech recognition. Dismissed permanently via
 * localStorage. Listens for a custom event from VoiceFAB so the banner
 * only appears on first voice activation rather than on page load.
 */
import { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';

const PRIVACY_KEY = 'voice-privacy-accepted';
const PRIVACY_EVENT = 'voice:show-privacy-banner';

export function VoicePrivacyBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // If already accepted, never show
    if (localStorage.getItem(PRIVACY_KEY)) return;

    const handleShowRequest = () => {
      setVisible(true);
    };

    window.addEventListener(PRIVACY_EVENT, handleShowRequest);
    return () => window.removeEventListener(PRIVACY_EVENT, handleShowRequest);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(PRIVACY_KEY, 'true');
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center pb-24 md:items-center md:pb-0 md:inset-0 bg-black/30"
      onClick={handleDismiss}
      role="dialog"
      aria-label="Aviso de privacidad de voz"
    >
      <div
        className="
          relative mx-4 w-full max-w-md rounded-lg border bg-card p-4
          text-card-foreground shadow-lg animate-in fade-in-0 zoom-in-95
          slide-in-from-bottom-4 duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 shrink-0 mt-0.5 text-yellow-500" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold">Navegación por voz</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              El audio se envía a servidores de Google para reconocimiento de voz.
              Los datos se procesan de forma segura y no se almacenan.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="
                  inline-flex items-center justify-center rounded-md
                  bg-primary px-4 py-2 text-sm font-medium
                  text-primary-foreground hover:bg-primary/90
                  transition-colors cursor-pointer
                "
              >
                Entendido
              </button>
              <a
                href="#"
                className="
                  inline-flex items-center justify-center rounded-md
                border px-4 py-2 text-sm font-medium
                  hover:bg-accent hover:text-accent-foreground
                  transition-colors
                "
                onClick={(e) => {
                  e.preventDefault();
                  // Privacy policy link placeholder
                }}
              >
                Más info
              </a>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="absolute top-2 right-2 rounded-md p-1 hover:bg-accent transition-colors cursor-pointer"
          onClick={handleDismiss}
          aria-label="Cerrar aviso"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}