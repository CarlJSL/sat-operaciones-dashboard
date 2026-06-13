import { DataTable } from "@/shared/components/table/data-table";
import { DataPagination } from "@/shared/components/table/data-pagination";
import { DataToolbar } from "@/shared/components/table/data-toolbar";
import { FiltroDrawer } from "@/shared/components/table/filtro-drawer";
import { Button } from "@/components/ui/button";
import { Filter, Plus } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useCatalogoSubItemLista } from "../hooks/useCatalogoSubItemLista";
import { Link, useParams } from "react-router-dom";
import { ModalContainer } from "@/shared/components/modal/modalContainer";
import {
  EditSubItemForm,
  EditSubItemFooter,
} from "../components/edit-subitem-form";
import { useState } from "react";
import {
  CreateSubItemForm,
  CreateSubItemFooter,
} from "../components/create-subitem-form";

export default function CatalogoItemListaPage() {
  const { catalogoId } = useParams<{ catalogoId: string }>();
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateDirty, setIsCreateDirty] = useState(false);

  const {
    editItem,
    handleCloseEdit,

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
  } = useCatalogoSubItemLista(catalogoId!);

  // Encapsulamos el cierre para además resetear el isDirty
  const closeEditModal = () => {
    setIsFormDirty(false);
    handleCloseEdit();
  };

  const closeCreateModal = () => {
    setIsCreateDirty(false);
    setIsCreateOpen(false);
  };

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
            <BreadcrumbLink asChild>
              <Link to="/catalogo">Catálogo</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          <BreadcrumbItem>
            {/* BreadcrumbPage es el texto final donde estás parado ahora (no es clickeable) */}
            <BreadcrumbPage>Items catálogo</BreadcrumbPage>
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
        <div className="flex items-center gap-2">
          <Button
            className="cursor-pointer"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4"/>
            Agregar Item
          </Button>
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
        </div>
      </DataToolbar>
      <ModalContainer
        title="Nuevo SubItem"
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateModal();
          else setIsCreateOpen(true);
        }}
        showRequiredNote
        footer={
          <CreateSubItemFooter
            onCancel={closeCreateModal}
            isDirty={isCreateDirty}
          />
        }
        className="sm:max-w-3xl"
      >
        {catalogoId && isCreateOpen && (
          <CreateSubItemForm
            referenciaCodigo={catalogoId}
            onSuccess={closeCreateModal}
            onDirtyChange={setIsCreateDirty}
          />
        )}
      </ModalContainer>

      <ModalContainer
        title="Editar SubItem"
        open={!!editItem}
        onOpenChange={(open) => {
          if (!open) closeEditModal();
        }}
        showRequiredNote
        footer={
          <EditSubItemFooter onCancel={closeEditModal} isDirty={isFormDirty} />
        }
        className="sm:max-w-3xl"
      >
        {editItem && (
          <EditSubItemForm
            catalogo={editItem}
            onSuccess={closeEditModal}
            onDirtyChange={setIsFormDirty}
          />
        )}
      </ModalContainer>

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
