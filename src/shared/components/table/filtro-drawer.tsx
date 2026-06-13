import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FilterFieldConfig } from "../../types/filter.types";
import { useState } from "react";

interface FiltroDrawerProps {
  title?: string;
  description?: string;
  fields: FilterFieldConfig[];
  triggerButton: React.ReactNode;
  onApply: (filters: Record<string, any>) => void;
  onClear: () => void;
}

export function FiltroDrawer({
  title = "Filtrar por",
  description = "Selecciona los filtros que deseas aplicar",
  fields,
  triggerButton,
  onApply,
  onClear,
}: FiltroDrawerProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const handleValueChange = (id: string, value: any) => {
    setFilterValues((prev) => ({ ...prev, [id]: value }));
  };
  const handleApply = () => {
    onApply(filterValues);
  };
  const handleClear = () => {
    setFilterValues({});
    onClear();
  };
  return (
    <Sheet>
      {/* Aquí inyectamos el botón personalizado que viene de la vista */}
      <SheetTrigger asChild>
        {triggerButton}
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {/* Generación dinámica de campos */}
        <div className="grid flex-1 auto-rows-min gap-6 px-4 py-6">
          {fields.map((field) => (
            <div key={field.id} className="grid gap-3">
              <Label htmlFor={`filter-${field.id}`}>{field.label}</Label>

              {(field.type === 'text' || field.type === 'number') && (
                <Input
                  id={`filter-${field.id}`}
                  type="text"
                  inputMode={field.type === 'number' ? 'numeric' : undefined}
                  pattern={field.type === 'number' ? '[0-9]*' : undefined}
                  placeholder={field.placeholder}
                  value={filterValues[field.id] || ''}
                  onChange={(e) => {
                    const rawValue = e.target.value;
                    const value =
                      field.type === 'number'
                        ? rawValue.replace(/\D/g, '')
                        : rawValue;
                    handleValueChange(field.id, value);
                  }}
                />
              )}
              {field.type === 'select' && (
                <Select
                  value={filterValues[field.id] || undefined}
                  onValueChange={(value) =>
                    handleValueChange(field.id, value === "__empty__" ? "" : value)
                  }
                >
                  <SelectTrigger id={`filter-${field.id}`} className="w-full">
                    <SelectValue placeholder={field.placeholder ?? "Seleccionar"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="__empty__">
                        {field.placeholder ?? "Seleccionar"}
                      </SelectItem>
                      {field.options?.map((opt) => (
                        <SelectItem key={String(opt.value)} value={String(opt.value)}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
        <SheetFooter>
          {/* Usamos SheetClose para que se esconda el drawer al presionar botones */}
          <SheetClose asChild>
            <Button type="button" onClick={handleApply}>Filtrar</Button>
          </SheetClose>
          <SheetClose asChild>
            <Button variant="outline" type="button" onClick={handleClear}>Limpiar Todo</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
