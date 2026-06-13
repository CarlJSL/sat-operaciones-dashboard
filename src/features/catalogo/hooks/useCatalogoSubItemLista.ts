import { CatalogoFiltro, Pagination, type Catalogo } from "@/domain/models";
import { catalogoService } from "@/shared/services/catalogo.service";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { getColumns } from "../components/columns-item";
import { useForm } from "react-hook-form";
import { CATALOGO_FILTROS_CONFIG } from "./catalogo-filtro-config";
import { useConfirmStore } from "@/shared/store/confirmStore";
import { queryClient } from "@/app/providers/QueryProvider";

async function getData(
  catalogoId: string,
  page: number,
  itemsPerPage: number,
  query: string,
  filtrosExtra?: Record<string, any>,
): Promise<{ elements: Catalogo[]; total: number }> {
  const filtro = new CatalogoFiltro();
  filtro.start = page - 1;
  filtro.limit = itemsPerPage;
  filtro.referenciaCodigo = catalogoId;

  if (query) {
    filtro.palabraClave = query;
  }

  if (filtrosExtra) {
    if (filtrosExtra.name) {
      filtro.nombre = filtrosExtra.name;
    }
  }

  const response = await catalogoService.findItem(filtro);

  return {
    elements: response.elements ?? [],
    total: response.totalCount ?? 0,
  };
}

export function useCatalogoSubItemLista(catalogoId: string) {
  const { watch, setValue } = useForm({
    defaultValues: {
      page: 1,
      itemsPerPage: 10,
      searchQuery: "",
      filtros: {} as Record<string, any>,
    },
  });

  const [editItem, setEditItem] = useState<Catalogo | null>(null);

  const page = watch("page");
  const itemsPerPage = watch("itemsPerPage");
  const searchQuery = watch("searchQuery");
  const filtrosAvanzados = watch("filtros");

  const filtrosDinamicos = CATALOGO_FILTROS_CONFIG;

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "catalogos",
      "lista",
      catalogoId,
      page,
      itemsPerPage,
      searchQuery,
      filtrosAvanzados,
    ],
    queryFn: () =>
      getData(catalogoId, page, itemsPerPage, searchQuery, filtrosAvanzados),
    staleTime: 1000 * 60 * 2,
    enabled: !!catalogoId,
  });

  const catalogos = data?.elements ?? [];
  const totalItems = data?.total ?? 0;

  const pagination = useMemo(() => {
    const p = new Pagination();
    p.setPagination(page, itemsPerPage, totalItems);
    return p;
  }, [page, itemsPerPage, totalItems]);

  const handleLimitChange = (value: number) => {
    setValue("itemsPerPage", value);
    setValue("page", 1);
  };

  const handleSearch = (value: string) => {
    setValue("searchQuery", value);
    setValue("page", 1);
  };

  const handleFilterApply = (filtros: Record<string, any>) => {
    setValue("filtros", filtros);
    setValue("page", 1);
  };

  const handleFilterClear = () => {
    setValue("filtros", {} as Record<string, any>);
    setValue("page", 1);
  };

  const handleEditar = useCallback((catalogo: Catalogo) => {
    setEditItem(catalogo);
  }, []);
  const handleCloseEdit = useCallback(() => {
    setEditItem(null);
  }, []);

  const confirm = useConfirmStore((s) => s.show);
  const handleDeshabilitar = useCallback(
    (catalogo: Catalogo) => {
      const isHabilitado =
        catalogo.habilitado === true || catalogo.habilitado === "true";

      const accion = isHabilitado ? "desactivar" : "activar";

      confirm({
        title: isHabilitado ? "Desactivar Catálogo" : "Activar Catálogo",
        message: `¿Estás seguro de que deseas ${accion} "${catalogo.nombre}"?`,
        icon: isHabilitado ? "destructive" : "success",
        onConfirm: async () => {
          await catalogoService.remove(catalogo.catalogoId);
          queryClient.invalidateQueries({ queryKey: ["catalogos"] });
        },
      });
    },
    [confirm],
  );

  const columnsDefinition = useMemo(
    () =>
      getColumns({
        onEditar: handleEditar, // por ahora
        onDeshabilitar: handleDeshabilitar,
      }),
    [handleDeshabilitar, handleEditar],
  );

  return {
    catalogos,
    isLoading,
    isError,
    pagination,
    itemsPerPage,
    searchQuery,
    setValue,

    filtrosDinamicos,
    handleLimitChange,
    handleSearch,

    handleFilterApply,
    handleFilterClear,
    columnsDefinition,

    editItem,
    handleCloseEdit,
  };
}
