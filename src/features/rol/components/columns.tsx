import type { ColumnDef } from "@tanstack/react-table";
import type { Rol } from "@/domain/roles/rol";
import { StatusBadge } from "@/shared/components/wrapper/status-badge";
import { Button } from "@/components/ui/button";
import {
  EditIcon,
  EyeIcon,
  MoreVertical,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const getColumns = (
  onVerRol?: (rol: Rol) => void,
  onEditarRol?: (rol: Rol) => void,
  onEstadoRol?: (rol: Rol) => void,
): ColumnDef<Rol>[] => [
  {
    id: "correlativo",
    header: "N°",
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },
  {
    id: "acciones",
    header: "Acciones",
    cell: ({ row }) => {
      const rol = row.original;
      const isHabilitado = rol.estadoCodigo === "ESRO001";

      return (
        <TooltipProvider delayDuration={0}>
            {onVerRol && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Ver Detalles"
                    className="cursor-pointer"
                    onClick={() => onVerRol(rol)}
                  >
                    <EyeIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver Detalles</p>
                </TooltipContent>
              </Tooltip>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="cursor-pointer text-zinc-600 hover:text-zinc-900"
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="end"
                sideOffset={6}
                className="w-44"
              >
                {onEditarRol && (
                  <DropdownMenuItem
                    onClick={() => onEditarRol(rol)}
                    className="cursor-pointer font-medium text-primary focus:text-primary focus:bg-primary-foreground"
                  >
                    <EditIcon className="mr-2" />
                    Editar Rol
                  </DropdownMenuItem>
                )}
                {onEstadoRol && (
                  <DropdownMenuItem
                    onClick={() => onEstadoRol(rol)}
                    className="cursor-pointer font-medium text-primary focus:text-primary focus:bg-primary-foreground"
                  >
                    {isHabilitado ? (
                      <UserRoundX className="mr-2" />
                    ) : (
                      <UserRoundCheck className="mr-2" />
                    )}
                    {isHabilitado ? "Deshabilitar" : "Habilitar"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => (
      <StatusBadge
        estado={row.original.estado}
        estadoCodigo={row.original.estadoCodigo}
      />
    ),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "codigo",
    header: "Código",
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
  },
];
