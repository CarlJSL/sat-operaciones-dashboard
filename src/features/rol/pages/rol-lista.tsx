import { DataTable } from "@/shared/components/table/data-table";
import { DataPagination } from "@/shared/components/table/data-pagination";
import { DataToolbar } from "@/shared/components/table/data-toolbar";
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
import { FiltroDrawer } from "@/shared/components/table/filtro-drawer";
import { useRolLista } from "../hooks/useRolLista";

const filtrosDinamicos = [
  {
    id: "nombre",
    label: "Nombre",
    type: "text" as const,
  },
];

export default function RolListaPage() {
  const {
    roles,
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
    columnsDefinition,
  } = useRolLista();

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Seguridad</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Roles</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
      </div>

      <DataToolbar
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleLimitChange}
        searchValue={searchQuery}
        onSearchChange={handleSearch}
      >
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
      </DataToolbar>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">
          Cargando roles...
        </div>
      ) : isError ? (
        <div className="text-sm text-red-600">
          No se pudo cargar la lista de roles.
        </div>
      ) : (
        <>
          <DataTable columns={columnsDefinition} data={roles} />
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
