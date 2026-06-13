import { Pagination, UsuarioFiltro, type Usuario } from "@/domain/models";
import { usuarioService } from "@/shared/services/usuario.service";
import { useQuery } from "@tanstack/react-query";
import { useUsuarioFiltrosConfig } from "./usuario-filtro-config";
import { useMemo, useState } from "react";
import { getColumns } from "../components/columns";
import { useForm } from "react-hook-form";
import { useConfirmStore } from "@/shared/store/confirmStore";
import { useSuccessStore } from "@/shared/store/successStore";
import { queryClient } from "@/app/providers/QueryProvider";
 
async function getData(
  page: number,
  itemsPerPage: number,
  query: string,
  filtrosExtra?: Record<string, any>,
): Promise<{ elements: Usuario[]; total: number }> {
  const filtro = new UsuarioFiltro();
  filtro.start = page - 1;
  filtro.limit = itemsPerPage;
  if (query) {
    filtro.palabraClave = query;
  }

  if (filtrosExtra) {
    if (filtrosExtra.name) filtro.nombreCompleto = filtrosExtra.name;
    if (filtrosExtra.numeroDocumento)
      filtro.numeroDocumento = filtrosExtra.numeroDocumento;
    if (filtrosExtra.estado) filtro.estadoCodigo = filtrosExtra.estado;
    if (filtrosExtra.tipoDocumento)
      filtro.tipoDocumentoCodigo = filtrosExtra.tipoDocumento;
    if (filtrosExtra.rol) filtro.rolId = filtrosExtra.rol;
  }

  const response = await usuarioService.find(filtro);

  return {
    elements: response.elements ?? [],
    total: response.totalCount ?? 0,
  };
}

export function useUsuarioLista() {
  const { watch, setValue } = useForm({
    defaultValues: {
      page: 1,
      itemsPerPage: 10,
      searchQuery: "",
      filtros: {} as Record<string, any>,
    },
  });

  const page = watch("page");
  const itemsPerPage = watch("itemsPerPage");
  const searchQuery = watch("searchQuery");
  const filtrosAvanzados = watch("filtros");

  const { data: combosInit } = useQuery({
    queryKey: ["usuario", "init"],
    queryFn: () => usuarioService.init(),
  });
  const filtrosDinamicos = useUsuarioFiltrosConfig(combosInit);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "usuarios",
      "lista",
      page,
      itemsPerPage,
      searchQuery,
      filtrosAvanzados,
    ],
    queryFn: () => getData(page, itemsPerPage, searchQuery, filtrosAvanzados),
  });

  const usuarios = data?.elements ?? [];
  const totalItems = data?.total ?? 0;

  const pagination = useMemo(() => {
    const p = new Pagination();
    p.setPagination(page, itemsPerPage, totalItems);
    return p;
  }, [page, itemsPerPage, totalItems]);

  // --- Handlers de la toolbar ---
  const handleLimitChange = (value: number) => {
    setValue("itemsPerPage", value);
    setValue("page", 1);
  };
  const handleSearch = (value: string) => {
    setValue("searchQuery", value);
    setValue("page", 1);
  };
  // --- Handlers del Drawer de Filtros ---
  const handleFilterApply = (filtros: Record<string, any>) => {
    setValue("filtros", filtros);
    setValue("page", 1);
  };
  const handleFilterClear = () => {
    setValue("filtros", {} as Record<string, any>);
    setValue("page", 1);
  };

  // --- Estado del Modal de Detalle ---
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioIdViendo, setUsuarioIdViendo] = useState<string | null>(null);
  const [usuarioIdEditando, setUsuarioIdEditando] = useState<string | null>(
    null,
  );
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);

  const confirmStore = useConfirmStore();
  const successStore = useSuccessStore();

  const handleVerUsuario = (usuario: Usuario) => {
    setUsuarioIdViendo(usuario.usuarioId);
    setModalAbierto(true);
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioIdEditando(usuario.usuarioId);
    setModalEditarAbierto(true);
  };

  const handleEstadoUsuario = (usuario: Usuario) => {
    const isHabilitado = usuario.estadoCodigo === "ESUS001";
    confirmStore.show({
      title: isHabilitado ? "Deshabilitar Usuario" : "Habilitar Usuario",
      message: `¿Está seguro de ${isHabilitado ? "deshabilitar" : "habilitar"} al usuario ${usuario.nombreCompleto}?`,
      icon: "BadgeAlert",
      iconColor: "text-brand-neutro",
      onConfirm: async () => {
        await usuarioService.remove(usuario.usuarioId);
        successStore.show({
          title: "Éxito",
          description: "Estado de usuario modificado correctamente.",
        });
        queryClient.invalidateQueries({ queryKey: ["usuarios", "lista"] });
      },
    });
  };

  const handleResetPassUsuario = (usuario: Usuario) => {
    confirmStore.show({
      title: "Resetear Contraseña",
      iconColor: "text-brand-destructive",
      message: `¿Está seguro de resetear la contraseña del usuario ${usuario.nombreCompleto}?`,
      icon: "RotateCcwKeyIcon",
      description: `Se enviará un enlace al correo asociado de ${usuario.usuario} para que pueda establecer una nueva contraseña. El enlace estará disponible por 48 horas.`,
      size: "lg",
      confirmText: "Resetear Contraseña",
      confirmVariant: "destructive",
      onConfirm: async () => {
        try {
          const res = await usuarioService.resetPassword(usuario.usuarioId);
          successStore.show({
            title: "Éxito",
            description: res.mensaje || "Contraseña reseteada correctamente.",
          });
        } catch (error) {
          console.error(error);
        }
      },
    });
  };
  const columnsDefinition = useMemo(
    () =>
      getColumns(
        handleVerUsuario,
        handleEditarUsuario,
        handleEstadoUsuario,
        handleResetPassUsuario,
      ),
    [],
  );

  // --- Estado del Modal de Crear ---
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

  return {
    // Tabla
    usuarios,
    isLoading,
    isError,
    pagination,
    itemsPerPage,
    searchQuery,
    setValue,
    // Toolbar
    handleLimitChange,
    handleSearch,
    // Filtros
    filtrosDinamicos,
    handleFilterApply,
    handleFilterClear,
    // Columnas
    columnsDefinition,
    // Modal detalle
    modalAbierto,
    setModalAbierto,
    usuarioIdViendo,
    // Modal crear / editar
    modalCrearAbierto,
    setModalCrearAbierto,
    usuarioIdEditando,
    setUsuarioIdEditando,
    modalEditarAbierto,
    setModalEditarAbierto,
  };
}
