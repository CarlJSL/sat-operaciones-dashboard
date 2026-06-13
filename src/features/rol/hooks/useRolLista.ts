import { useMemo, useState } from "react";
import { useListPage } from "@/shared/hooks/useListPage";
import { rolService } from "@/shared/services/rol.service";
import { getColumns } from "../components/columns";
import { RolFiltro, type Rol } from "@/domain/roles/rol";
import { useConfirmStore } from "@/shared/store/confirmStore";
import { useSuccessStore } from "@/shared/store/successStore";
import { queryClient } from "@/app/providers/QueryProvider";

type RolFiltros = { nombre?: string; estado?: string };

export function useRolLista() {
  // 1. Estado de modales específicos de Rol
  const [modalVerAbierto, setModalVerAbierto] = useState(false);
  const [rolIdViendo, setRolIdViendo] = useState<string | null>(null);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [rolIdEditando, setRolIdEditando] = useState<string | null>(null);

  const confirmStore = useConfirmStore();
  const successStore = useSuccessStore();

  // 2. Hook Genérico con fetchData específico de Rol
  const {
    elements: roles,
    isLoading,
    isError,
    pagination,
    itemsPerPage,
    searchQuery,
    setValue,
    handleLimitChange,
    handleSearch,
    handleFilterApply,
    handleFilterClear,
  } = useListPage<Rol, RolFiltros>({
    queryKey: ["rol", "lista"],
    fetchData: async (page, limit, search, filtrosExtra) => {
      const filtro = new RolFiltro();
      filtro.start = page - 1;
      filtro.limit = limit;
      if (search) filtro.nombre = search;
      if (filtrosExtra?.nombre) filtro.nombre = filtrosExtra.nombre;

      const response = await rolService.find(filtro);
      return {
        elements: response.elements ?? [],
        total: response.totalCount ?? 0,
      };
    },
  });

  // 3. Handlers personalizados del módulo
  const handleVerRol = (rol: Rol) => {
    setRolIdViendo(rol.rolId);
    setModalVerAbierto(true);
  };

  const handleEditarRol = (rol: Rol) => {
    setRolIdEditando(rol.rolId);
    setModalEditarAbierto(true);
  };

  const handleEstadoRol = (rol: Rol) => {
    const isHabilitado = rol.estadoCodigo === "ESRO001";
    confirmStore.show({
      title: isHabilitado ? "Deshabilitar Rol" : "Habilitar Rol",
      message: `¿Está seguro de ${isHabilitado ? "deshabilitar" : "habilitar"} el rol "${rol.nombre}"?`,
      icon: "BadgeAlert",
      iconColor: "text-brand-neutro",
      onConfirm: async () => {
        await rolService.remove(rol.rolId);
        successStore.show({
          title: "Éxito",
          description: "Estado del rol modificado correctamente.",
        });
        queryClient.invalidateQueries({ queryKey: ["rol", "lista"] });
      },
    });
  };

  // 4. Columnas con handlers inyectados
  const columnsDefinition = useMemo(
    () => getColumns(handleVerRol, handleEditarRol, handleEstadoRol),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    // Tabla
    roles,
    isLoading,
    isError,
    pagination,
    itemsPerPage,
    searchQuery,
    setValue,
    // Toolbar
    handleLimitChange,
    handleSearch,
    // Filtros (sin drawer dinámico por ahora, se puede ampliar)
    handleFilterApply,
    handleFilterClear,
    // Columnas
    columnsDefinition,
    // Modal ver
    modalVerAbierto,
    setModalVerAbierto,
    rolIdViendo,
    // Modal editar
    modalEditarAbierto,
    setModalEditarAbierto,
    rolIdEditando,
    setRolIdEditando,
  };
}
