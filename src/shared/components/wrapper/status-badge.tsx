import { cn } from "@/core/lib/utils";

export const getStatusColorClass = (estadoCodigo?: string, estado?: string) => {
  const normEstado = estado?.toLowerCase()?.trim() || "";
  const normCodigo = estadoCodigo?.toUpperCase()?.trim() || "";

  // 1. Excepciones por nombre (Ej. Seguimiento)
  if (normEstado === "pendiente")
    return "bg-[var(--status-pending-bg)] text-[var(--status-pending-fg)] border border-[var(--status-pending-border)] shadow-sm";
  if (normEstado === "en proceso")
    return "bg-[var(--status-in-process-bg)] text-[var(--status-in-process-fg)] border border-[var(--status-in-process-border)] shadow-sm";
  if (normEstado === "cerrado")
    return "bg-[var(--status-closed-bg)] text-[var(--status-closed-fg)] border border-[var(--status-closed-border)] shadow-sm";

  // 2. Patrones genéricos por terminación de código o nombre
  // Códigos 001 equivalen a positivos (Activo, Habilitado, etc.)
  if (
    normCodigo.endsWith("001") ||
    normEstado === "activo" ||
    normEstado === "habilitado"
  ) {
    return "bg-[var(--status-active-bg)] text-[var(--status-active-fg)] inset-ring inset-ring-[var(--status-active-border)] border-transparent";
  }

  // Códigos 002 equivalen a negativos (Inactivo, Deshabilitado, etc.)
  if (
    normCodigo.endsWith("002") ||
    normEstado === "inactivo" ||
    normEstado === "deshabilitado"
  ) {
    return "bg-[var(--status-inactive-bg)] text-[var(--status-inactive-fg)] inset-ring inset-ring-[var(--status-inactive-border)]";
  }

  // Default
  return "bg-[var(--status-default-bg)] text-[var(--status-default-fg)] inset-ring inset-ring-[var(--status-default-border)]";
};

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  estadoCodigo?: string;
  estado?: string;
}

export function StatusBadge({
  className,
  estadoCodigo,
  estado,
  children,
  ...props
}: StatusBadgeProps) {
  const defaultClasses =
    "inline-flex items-center rounded-md px-3 py-0.5 text-xs font-semibold whitespace-nowrap";
  const statusClasses = getStatusColorClass(estadoCodigo, estado);
  const resolvedLabel = (() => {
    if (typeof children === "string") {
      return children.trim() || "Sin estado";
    }

    if (children != null) {
      return children;
    }

    const normalizedEstado = estado?.trim();
    if (normalizedEstado) {
      return normalizedEstado;
    }

    const normalizedCodigo = estadoCodigo?.trim();
    if (normalizedCodigo) {
      return normalizedCodigo;
    }

    return "Sin estado";
  })();

  return (
    <span className={cn(defaultClasses, statusClasses, className)} {...props}>
      {resolvedLabel}
    </span>
  );
}
