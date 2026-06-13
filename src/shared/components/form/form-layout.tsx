import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function FormCard({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">
      {children}
    </div>
  );
}

// Fila de 2 o 4 columnas (1 en móvil)
interface FormRowProps {
  children: ReactNode;
  cols?: 2 | 4;
}

export function FormRow({ children, cols = 2 }: FormRowProps) {
  const colsClass = cols === 4
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    : "grid-cols-1 sm:grid-cols-2";
  return (
    <div className={`grid gap-4 ${colsClass}`}>
      {children}
    </div>
  );
}

// Campo individual: label + input + error
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  colSpan?: "full" | 2;
}

export function FormField({ label, required, error, children, colSpan }: FormFieldProps) {
  const spanClass = colSpan === "full"
    ? "col-span-full"
    : colSpan === 2
    ? "col-span-2"
    : "";
  return (
    <div className={`flex flex-col gap-1 ${spanClass}`}>
      <Label>
        {label}{required && <span className="text-red-500"> *</span>}
      </Label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
