export interface PaginatedResponse<T> {
  elements: T[];
  start: number;
  sort: string;
  limit: number;
  totalCount: number;
}

export class Pagination {
  number = 0;
  total = 0;
  elements = 0;
  offset!: number;
  currentPage = 0;
  totalPages = 0;

  setPagination(start: number, limit: number, total: number) {
    this.number = start;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.elements = total;
    this.offset = (start - 1) * limit + 1;
    this.currentPage = start;
  }
}
