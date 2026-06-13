import { Button } from "@/components/ui/button";
import type { Catalogo } from "@/domain/models";
import { StatusBadge } from "@/shared/components/wrapper/status-badge";
import type { ColumnDef } from "@tanstack/react-table";
import { Ban, LayoutList, Pencil, CircleCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CatalogoColumnActions {
  // Item (padre) tiene acción de ver subitems
  onVerSubItems?: (catalogo: Catalogo) => void;
  // SubItem tiene acción de editar
  onEditar?: (catalogo: Catalogo) => void;
  // Ambos comparten Ban (deshabilitar)
  onDeshabilitar?: (catalogo: Catalogo) => void;
}

export const getColumns = (
  actions: CatalogoColumnActions,
): ColumnDef<Catalogo>[] => [
  {
    id: "correlativo",
    header: "N°",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
    },
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const item = row.original;
       const isHabilitado = item.habilitado === true || item.habilitado === "true";
      return (
        <TooltipProvider delayDuration={0}>
          <div className="flex gap-2 justify-center">
            {/* Solo aparece si se pasa la acción */}
            {actions.onVerSubItems && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => actions.onVerSubItems!(item)}
                  >
                    <LayoutList />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver Subítems</p>
                </TooltipContent>
              </Tooltip>
            )}
            {actions.onEditar && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => actions.onEditar!(item)}
                    className="cursor-pointer"
                  >
                    <Pencil />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Editar</p>
                </TooltipContent>
              </Tooltip>
            )}
            {actions.onDeshabilitar && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => actions.onDeshabilitar!(item)}
                    className="cursor-pointer"
                  >
                    {isHabilitado ? <Ban /> : <CircleCheck /> }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isHabilitado ? "Deshabilitar" : "Habilitar"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const habilitado = String(row.original.habilitado) === "true";
      return (
        <StatusBadge estado={habilitado ? "Activo" : "Inactivo"} />
      );
    },
  },
  {
    accessorKey: "codigo",
    header: "Código",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
  {
    accessorKey: "orden",
    header: "Orden",
  },
  {
    accessorKey: "valor1",
    header: "Valor 1",
  },
  {
    accessorKey: "valor2",
    header: "Valor 2",
  },
];
