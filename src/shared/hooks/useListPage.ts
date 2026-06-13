import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@/domain/models";

export interface UseListPageProps<T, F> {
  queryKey: unknown[];
  fetchData: (
    page: number,
    limit: number,
    search: string,
    filtros: F
  ) => Promise<{ elements: T[]; total: number }>;
  defaultLimit?: number;
  enabled?: boolean;
}

export function useListPage<T, F = Record<string, unknown>>({
  queryKey,
  fetchData,
  defaultLimit = 10,
  enabled = true,
}: UseListPageProps<T, F>) {
  // En vez de react-hook-form, usamos estado nativo para mayor compatibilidad con React Compiler
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(defaultLimit);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filtros, setFiltros] = useState<F>({} as F);

  // Mantenemos la misma firma de setValue por compatibilidad (opcional, pero útil)
  const setValue = (field: string, value: unknown) => {
    switch (field) {
      case "page":
        setPage(value as number);
        break;
      case "itemsPerPage":
        setItemsPerPage(value as number);
        break;
      case "searchQuery":
        setSearchQuery(value as string);
        break;
      case "filtros":
        setFiltros(value as F);
        break;
    }
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...queryKey, page, itemsPerPage, searchQuery, filtros],
    queryFn: () => fetchData(page, itemsPerPage, searchQuery, filtros),
    retry: false,
    enabled,
  });

  const elements = data?.elements ?? [];
  const totalItems = data?.total ?? 0;

  const pagination = useMemo(() => {
    const p = new Pagination();
    p.setPagination(page, itemsPerPage, totalItems);
    return p;
  }, [page, itemsPerPage, totalItems]);

  const handleLimitChange = (value: number) => {
    setItemsPerPage(value);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleFilterApply = (nuevosFiltros: F) => {
    setFiltros(nuevosFiltros);
    setPage(1);
  };

  const handleFilterClear = () => {
    setFiltros({} as F);
    setPage(1);
  };

  return {
    elements,
    isLoading,
    isError,
    pagination,
    itemsPerPage,
    searchQuery,
    filtros,
    setValue,
    handleLimitChange,
    handleSearch,
    handleFilterApply,
    handleFilterClear,
    refetch,
  };
}
