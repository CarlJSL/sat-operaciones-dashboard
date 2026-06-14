/**
 * VoiceCommandHint — overlay showing available voice commands.
 *
 * Triggered by saying "ayuda" or "qué puedo decir" (registered as
 * global commands in VoiceProvider). Displays commands grouped by
 * scope: navegación, acciones, globales. Dismissed by clicking
 * outside, pressing Escape, or saying "cerrar" (also a global command).
 */
import { useEffect } from 'react';
import { X, Mic } from 'lucide-react';
import { useVoiceContext } from '../context/voiceContext';
import type { VoiceCommandEntry } from '../types/voice.types';

/** Human-readable labels for known scopes. */
const SCOPE_LABELS: Record<string, string> = {
  __global__: 'Globales',
  navegacion: 'Navegación',
  acciones: 'Acciones',
};

/** Sort order: Globales last, others alphabetically. */
function sortGroups(a: string, b: string): number {
  if (a === 'Globales') return 1;
  if (b === 'Globales') return -1;
  return a.localeCompare(b);
}

function getGroupLabel(scope?: string): string {
  if (!scope || scope === '__global__') return SCOPE_LABELS.__global__;
  return SCOPE_LABELS[scope] ?? 'Otras';
}

/** Map of canonical patterns to human-friendly labels. */
const PATTERN_LABELS: Record<string, string> = {
  volver: 'volver / atrás / retroceder / regresar',
  inicio: 'inicio / principal / home / plataforma',
  salir: 'salir / cerrar sesión / logout',
  ayuda: 'ayuda / asistencia / qué puedo decir / comandos',
  cerrar: 'cerrar / ocultar',
};

function getCommandLabel(pattern: string): string {
  return PATTERN_LABELS[pattern] ?? pattern;
}

export function VoiceCommandHint() {
  const { commandHintVisible, hideCommandHint, getCommands } = useVoiceContext();

  // Close on Escape
  useEffect(() => {
    if (!commandHintVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideCommandHint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandHintVisible, hideCommandHint]);

  if (!commandHintVisible) return null;

  const commands: VoiceCommandEntry[] = getCommands();

  // Group commands by scope label
  const grouped = new Map<string, VoiceCommandEntry[]>();
  for (const cmd of commands) {
    const label = getGroupLabel(cmd.scope);
    const list = grouped.get(label) ?? [];
    list.push(cmd);
    grouped.set(label, list);
  }

  const sortedGroups = [...grouped.keys()].sort(sortGroups);

  return (
    <div
      className="fixed inset-0 z-[55] flex items-end justify-center pb-20 md:items-center md:pb-0 bg-black/30"
      onClick={hideCommandHint}
      role="dialog"
      aria-label="Comandos de voz disponibles"
    >
      <div
        className="
          mx-4 w-full max-w-md rounded-lg border bg-card p-4
          text-card-foreground shadow-lg max-h-[60vh] overflow-y-auto
          animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mic className="size-5 text-primary" />
            <h3 className="text-sm font-semibold">Comandos de voz</h3>
          </div>
          <button
            type="button"
            className="rounded-md p-1 hover:bg-accent transition-colors cursor-pointer"
            onClick={hideCommandHint}
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        {sortedGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay comandos disponibles en esta página.
          </p>
        ) : (
          <div className="space-y-3">
            {sortedGroups.map((group) => (
              <div key={group}>
                <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                  {group}
                </h4>
                <ul className="space-y-1">
                  {grouped.get(group)?.map((cmd, i) => (
                    <li
                      key={`${cmd.pattern}-${i}`}
                      className="
                        flex items-center gap-2 rounded-md px-2 py-1
                        text-sm bg-muted/50
                      "
                    >
                      <span className="size-1.5 rounded-full bg-primary shrink-0" />
                      <span className="truncate">{getCommandLabel(cmd.pattern)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <p className="mt-3 pt-2 border-t text-xs text-muted-foreground text-center">
          Di <strong>&quot;cerrar&quot;</strong> para ocultar este panel
        </p>
      </div>
    </div>
  );
}