import { DataTable } from "@/shared/components/table/data-table";
import { DataPagination } from "@/shared/components/table/data-pagination";
import { DataToolbar } from "@/shared/components/table/data-toolbar";
import { FiltroDrawer } from "@/shared/components/table/filtro-drawer";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCatalogoLista } from "../hooks/useCatalogoLista";

export default function CatalogoListaPage() {
  const {
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
  } = useCatalogoLista();
  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Configuración</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {/* BreadcrumbPage es el texto final donde estás parado ahora (no es clickeable) */}
            <BreadcrumbPage>Catálogo</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Controles superiores de la tabla */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
      </div>
      {/* 1. Barra de Herramientas (Selectores y Búsqueda) a la izquierda */}
      <DataToolbar
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleLimitChange}
        searchValue={searchQuery}
        onSearchChange={handleSearch}
      >
        {
          /* 2. Botón de Filtros Dinámico a la derecha */
          <FiltroDrawer
            title="Filtrar por"
           fields={filtrosDinamicos}
            onApply={handleFilterApply}
            onClear={handleFilterClear}
            triggerButton={
              <Button variant="outline" className="flex items-center gap-2 h-8">
                <Filter className="w-4 h-4" />
              </Button>
            }
          />
        }
      </DataToolbar>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">
          Cargando datos...
        </div>
      ) : isError ? (
        <div className="text-sm text-red-600">
          No se pudo cargar la lista de Catalogo.
        </div>
      ) : (
        <>
          <DataTable columns={columnsDefinition} data={catalogos} />
          <DataPagination
            pagination={pagination}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setValue("page", p)}
          />
        </>
      )}
     
    </div>
  );
}
