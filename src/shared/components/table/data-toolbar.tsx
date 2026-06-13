import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";

import { SearchIcon, Plus } from "lucide-react";
import { ButtonGroup } from "../../../components/ui/button-group";
import { Button } from "../../../components/ui/button";

interface DataToolbarProps {
  /** Cantidad actual de elementos por página */
  itemsPerPage: number;
  /** Función a ejecutar cuando el usuario cambia el límite de la página */
  onItemsPerPageChange: (value: number) => void;
  /** Valor opcional para la futura barra de búsqueda */
  searchValue?: string;
  /** Función opcional para manejar la búsqueda */
  onSearchChange?: (value: string) => void;
  children?: React.ReactNode;
  /** Props opcionales para el botón "Crear" */
  onCreateClick?: () => void;
  createButtonLabel?: string;
  /** Icono opcional para el botón Crear (sobrescribe el `Plus` por defecto) */
  createButtonIcon?: React.ReactNode;
}

export function DataToolbar({
  itemsPerPage,
  onItemsPerPageChange,
  searchValue = "",
  onSearchChange,
  children,
  onCreateClick,
  createButtonLabel = "Crear",
  createButtonIcon,
}: DataToolbarProps) {
  const { register, handleSubmit } = useForm({
    defaultValues: { search: searchValue },
  });

  const onSubmit = (data: { search: string }) => {
    onSearchChange?.(data.search);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 px-1">

      {/* Fila 1 (mobile) / Izquierda (desktop): Paginador */}
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium whitespace-nowrap">Mostrar</p>
        <Select
          value={`${itemsPerPage}`}
          onValueChange={(val) => onItemsPerPageChange(Number(val))}
        >
          <SelectTrigger className="h-8 w-17.5">
            <SelectValue placeholder={itemsPerPage} />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectGroup>
              {[5, 10, 20, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <p className="text-sm font-medium whitespace-nowrap">Datos por página</p>
      </div>

      {/* Fila 2 (mobile) / Centro (desktop): Buscador ancho completo en mobile */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center w-full sm:w-auto sm:flex-1 sm:max-w-xs"
      >
        <ButtonGroup className="h-8 w-full">
          <Input
            placeholder="Buscar..."
            {...register("search")}
            className="w-full"
          />
          <Button
            variant="outline"
            aria-label="Search"
            type="submit"
            className="px-2 shrink-0"
          >
            <SearchIcon />
          </Button>
        </ButtonGroup>
      </form>

      {/* Fila 3 (mobile) / Derecha (desktop): Botón Crear + Filtros */}
      {(onCreateClick || children) && (
        <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            {onCreateClick && (
              <Button
                className="flex items-center gap-2 cursor-pointer flex-1 sm:flex-none justify-center"
                onClick={onCreateClick}
              >
                {createButtonIcon ?? <Plus data-icon="inline-start" />}
                {createButtonLabel}
              </Button>
            )}
          {children}
        </div>
      )}

    </div>
  );
}
