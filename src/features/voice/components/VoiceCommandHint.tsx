/**
 * VoiceCommandHint — panel de ayuda por voz para adultos mayores.
 *
 * Muestra frases de ejemplo que la gente puede decir, agrupadas por
 * categorías intuitivas con íconos grandes y texto amplio.
 * Se abre diciendo "ayuda", "qué puedo decir" o "comandos".
 */
import { useEffect } from 'react';
import {
  X, Mic, Navigation, Search, CreditCard, FileText,
  MessageCircle, StopCircle,
} from 'lucide-react';
import { useVoiceContext } from '../context/voiceContext';

/** Guía de frases que el usuario puede decir, con ejemplos reales. */
const GUIDE_SECTIONS = [
  {
    icon: Navigation,
    title: 'Moverse por la app',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    phrases: [
      { say: '"Ir al inicio"', does: 'Va a la pantalla principal' },
      { say: '"Volver" o "atrás"', does: 'Vuelve a la página anterior' },
      { say: '"Quiero ver mis multas"', does: 'Abre la consulta de papeletas' },
      { say: '"Registrarme para alertas"', does: 'Va a Notifícame' },
    ],
  },
  {
    icon: Search,
    title: 'Buscar papeletas',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    phrases: [
      { say: '"Buscar CP155801"', does: 'Busca por número de papeleta' },
      { say: '"Consultar placa A1G359"', does: 'Busca por número de placa' },
      { say: '"Buscar DNI 12345678"', does: 'Busca por documento' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Pagar y reclamar',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    phrases: [
      { say: '"Pagar la multa"', does: 'Abre la pasarela de pago' },
      { say: '"Hacer un reclamo"', does: 'Abre el formulario de reclamo' },
      { say: '"Presentar descargo"', does: 'Igual que reclamo' },
    ],
  },
  {
    icon: FileText,
    title: 'Documentos',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    phrases: [
      { say: '"Imprimir constancia"', does: 'Prepara la constancia' },
      { say: '"Descargar expediente"', does: 'Baja el documento digital' },
      { say: '"Ver la foto"', does: 'Muestra la evidencia de la infracción' },
      { say: '"Cerrar foto"', does: 'Cierra la imagen' },
    ],
  },
  {
    icon: MessageCircle,
    title: 'Ayuda y contacto',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    phrases: [
      { say: '"Hablar con un asesor"', does: 'Abre chat de WhatsApp con el SAT' },
      { say: '"Ayuda" o "no sé qué hacer"', does: 'Muestra este panel' },
    ],
  },
  {
    icon: StopCircle,
    title: 'Control de voz',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    phrases: [
      { say: '"Detener" o "parar"', does: 'Apaga el micrófono' },
      { say: '"Cerrar"', does: 'Cierra este panel de ayuda' },
      { say: '"Salir" o "cerrar sesión"', does: 'Cierra tu cuenta' },
    ],
  },
];

export function VoiceCommandHint() {
  const { commandHintVisible, hideCommandHint } = useVoiceContext();

  useEffect(() => {
    if (!commandHintVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideCommandHint();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandHintVisible, hideCommandHint]);

  if (!commandHintVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center md:items-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={hideCommandHint}
      role="dialog"
      aria-label="Guía de comandos de voz"
    >
      <div
        className="mx-4 w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-8 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-platform-blue text-white px-6 py-5 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-full bg-white/20">
              <Mic className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black">¿Qué podés decir?</h2>
              <p className="text-sm font-medium text-blue-200">Guía de comandos por voz</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full p-2 hover:bg-white/20 transition-colors cursor-pointer"
            onClick={hideCommandHint}
            aria-label="Cerrar ayuda"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Intro */}
        <div className="px-6 pt-5 pb-3">
          <p className="text-base text-zinc-600 leading-relaxed">
            Presioná el <strong className="text-platform-blue">botón azul del micrófono 🎙️</strong> abajo a la derecha,
            mantenelo presionado mientras hablás, y <strong className="text-platform-blue">soltalo</strong> cuando termines.
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            También podés usar <strong>Ctrl + Shift + V</strong> en el teclado.
          </p>
        </div>

        {/* Guide sections */}
        <div className="px-4 pb-6 space-y-3">
          {GUIDE_SECTIONS.map((section) => (
            <div
              key={section.title}
              className={`rounded-2xl ${section.bg} p-4`}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <section.icon className={`size-5 ${section.color}`} />
                <h3 className={`text-base font-black ${section.color}`}>
                  {section.title}
                </h3>
              </div>
              <div className="space-y-2">
                {section.phrases.map((phrase, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2 bg-white/70 rounded-xl px-3.5 py-2.5"
                  >
                    <span className="text-base font-bold text-zinc-800 shrink-0">
                      {phrase.say}
                    </span>
                    <span className="text-sm text-zinc-500">
                      → {phrase.does}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="sticky bottom-0 bg-zinc-50 border-t px-6 py-4 text-center rounded-b-3xl">
          <p className="text-sm text-zinc-500">
            Decí <strong className="text-platform-blue">"cerrar"</strong> o tocá fuera para salir
          </p>
        </div>
      </div>
    </div>
  );
}
