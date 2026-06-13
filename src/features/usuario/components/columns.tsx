import type { ColumnDef } from "@tanstack/react-table";
import type { Usuario } from "@/domain/models/usuario";

import { StatusBadge } from "@/shared/components/wrapper/status-badge";
import { Button } from "@/components/ui/button";
import {
  EditIcon,
  EyeIcon,
  MoreVertical,
  RotateCcwKeyIcon,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { formatDate, formatTime } from "@/core/lib/date-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const getColumns = (
  onVerUsuario: (usuario: Usuario) => void,
  onEditarUsuario: (usuario: Usuario) => void,
  onEstadoUsuario: (usuario: Usuario) => void,
  onResetPassUsuario: (usuario: Usuario) => void,
): ColumnDef<Usuario>[] => [
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
      const usuario = row.original;
      const isHabilitado = usuario.habilitado;

      return (
        <TooltipProvider delayDuration={0}>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon-sm"
                  aria-label="Ver Detalles"
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => onVerUsuario(usuario)}
                >
                  <EyeIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver Detalles</p>
              </TooltipContent>
            </Tooltip>
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
                className="w-48"
              >
                {onEditarUsuario && (
                  <DropdownMenuItem
                    onClick={() => onEditarUsuario(usuario)}
                    className="cursor-pointer font-medium text-primary focus:text-primary focus:bg-primary-foreground"
                  >
                    <EditIcon className="mr-2" />
                    Editar Usuario
                  </DropdownMenuItem>
                )}
                {onEstadoUsuario && (
                  <DropdownMenuItem
                    onClick={() => onEstadoUsuario(usuario)}
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
                {onResetPassUsuario && (
                  <DropdownMenuItem
                    onClick={() => onResetPassUsuario(usuario)}
                    className="cursor-pointer font-medium text-primary focus:text-primary focus:bg-primary-foreground"
                  >
                    <RotateCcwKeyIcon className="mr-2" />
                    Resetear Contraseña
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estadoObj = row.original;
      return (
        <StatusBadge
          estado={estadoObj.estadoNombre}
          estadoCodigo={estadoObj.estadoCodigo}
        />
      );
    },
  },
  {
    accessorKey: "usuario",
    header: "Usuario",
  },
  {
    accessorKey: "rolNombre",
    header: "Rol",
  },
  {
    accessorKey: "nombreCompleto",
    header: "Nombre Completo",
  },
  {
    accessorKey: "correo",
    header: "Correo",
  },
  {
    accessorKey: "celular",
    header: "Teléfono",
  },
  {
    accessorKey: "fechaRegistro",
    header: "Fecha Registro",
    cell: ({ row }) => {
      const fecha = row.original.fechaRegistro;
      if (!fecha) return null;

      return (
        <div className="flex flex-col">
          <span>{formatDate(fecha)}</span>
          <span>{formatTime(fecha)}</span>
        </div>
      );
    },
  },
];
