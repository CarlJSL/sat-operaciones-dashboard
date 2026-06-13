/**
 * Formato estándar de fecha: DD/MM/YYYY
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Formato estándar de hora: hh:mm a.m./p.m.
 */
export function formatTime(dateString: string | Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Formato de hora completa con segundos: hh:mm:ss
 */
export function formatTimeWithSeconds(dateString: string | Date): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Retorna fecha y hora formateadas por separado
 */
export function formatDateTime(dateString: string | Date): { date: string; time: string } | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return {
      date: formatDate(date),
      time: formatTimeWithSeconds(date),
    };
  } catch {
    return null;
  }
}
