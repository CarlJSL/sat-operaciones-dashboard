import { DataTable } from "@/shared/components/table/data-table";
import { DataPagination } from "@/shared/components/table/data-pagination";
import { DataToolbar } from "@/shared/components/table/data-toolbar";
import { FiltroDrawer } from "@/shared/components/table/filtro-drawer";
import { Button } from "@/components/ui/button";
import { Filter} from "lucide-react";
import {
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator, 
} from "@/components/ui/breadcrumb";
import { UsuarioDetalleModal } from "../components/modal/usuario-detalle-modal";
import { UsuarioCrearModal } from "../components/modal/usuario-crear-modal";
import { UsuarioEditarModal } from "../components/modal/usuario-editar-modal";
import { useUsuarioLista } from "../hooks/useUsuarioLista";

export default function UsuarioListaPage() {
  const {
    usuarios,
    isLoading,
    isError,
    pagination,
    itemsPerPage,
    searchQuery,
    setValue,
    handleLimitChange,
    handleSearch,
    filtrosDinamicos,
    handleFilterApply,
    handleFilterClear,
    columnsDefinition,
    modalAbierto,
    setModalAbierto,
    usuarioIdViendo,
    modalCrearAbierto,
    setModalCrearAbierto,
    usuarioIdEditando,
    setUsuarioIdEditando,
    modalEditarAbierto,
    setModalEditarAbierto,
  } = useUsuarioLista();

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb className="mb-2">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink>Seguridad</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {/* BreadcrumbPage es el texto final donde estás parado ahora (no es clickeable) */}
            <BreadcrumbPage>Usuarios</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Controles superiores de la tabla */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
      </div>
      {/* 1. Barra de Herramientas (Selectores y Búsqueda) a la izquierda */}
      <DataToolbar
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleLimitChange}
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        onCreateClick={() => setModalCrearAbierto(true)}
        createButtonLabel="Crear Usuario"
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
          Cargando usuarios...
        </div>
      ) : isError ? (
        <div className="text-sm text-red-600">
          No se pudo cargar la lista de usuarios.
        </div>
      ) : (
        <>
          <DataTable columns={columnsDefinition} data={usuarios} />
          <DataPagination
            pagination={pagination}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setValue("page", p)}
          />
        </>
      )}
      <UsuarioDetalleModal
        open={modalAbierto}
        onOpenChange={setModalAbierto}
        usuarioId={usuarioIdViendo}
      />
      <UsuarioCrearModal
        open={modalCrearAbierto}
        onOpenChange={setModalCrearAbierto}
      />
      <UsuarioEditarModal
        open={modalEditarAbierto}
        onOpenChange={(op) => {
          setModalEditarAbierto(op);
          if (!op) setUsuarioIdEditando(null);
        }}
        usuarioId={usuarioIdEditando}
      />
    </div>
  );
}
