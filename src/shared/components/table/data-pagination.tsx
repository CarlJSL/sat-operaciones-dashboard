import { Pagination as PaginationModel } from "@/domain/models/config/pagination"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface DataPaginationProps {
  /** Objeto de Paginación del dominio que contiene total, current page, totales, offset, etc */
  pagination: PaginationModel;
  /** Cuántos elementos se muestran por página */
  itemsPerPage: number;
  /** Función a ejecutar cuando el usuario cambia de página */
  onPageChange: (page: number) => void;
}

export function DataPagination({
  pagination,
  itemsPerPage,
  onPageChange,
}: DataPaginationProps) {
  const { currentPage, totalPages, total: totalItems } = pagination;
  
  // Cálculo de los textos "Mostrando X a Y de Z datos"
  // El offset de la clase Pagination ya calcula el inicio: (start - 1) * limit + 1
  const startItem = totalItems === 0 ? 0 : pagination.offset;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Funciones de navegación
  const handlePrevious = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  /**
   * Generador de números de página inteligente.
   * Si hay 10 páginas y estamos en la 5, mostrará cosas como: 1 ... 4 5 6 ... 10
   */
  const getVisiblePages = () => {
    const delta = 1; // Cuántos a la izq y der de la actual mostrar
    const range: number[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) range.unshift(-1); // -1 representará Ellipsis
    if (currentPage + delta < totalPages - 1) range.push(-1);

    range.unshift(1); // Siempre mostrar la primera
    if (totalPages > 1) range.push(totalPages); // Siempre mostrar la última

    return range;
  };

  const visiblePages = totalPages > 0 ? getVisiblePages() : [];
  let ellipsisCount = 0;

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row px-2">
      {/* Información lado izquierdo */}
      <div className="text-sm text-muted-foreground whitespace-nowrap">
        Mostrando <span className="font-medium text-foreground">{startItem}</span> a{" "}
        <span className="font-medium text-foreground">{endItem}</span> de{" "}
        <span className="font-medium text-foreground">{totalItems}</span> datos
      </div>

      {/* Controles de paginación lado derecho */}
      <div className="flex items-center space-x-6 sm:space-x-8">
        <div className="text-sm text-muted-foreground whitespace-nowrap hidden sm:block">
          {totalPages === 0 ? 0 : currentPage} de {totalPages} páginas
        </div>
        
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={handlePrevious} 
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
              />
            </PaginationItem>

            {visiblePages.map((page) => {
              const key =
                page === -1 ? `ellipsis-${ellipsisCount++}` : `page-${page}`;

              return (
                <PaginationItem key={key}>
                  {page === -1 ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => onPageChange(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext 
                onClick={handleNext} 
                className={currentPage === totalPages || totalPages === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
