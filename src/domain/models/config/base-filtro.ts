export class BaseFiltro {
  habilitado!: boolean;
  palabraClave!: string;
  limit: number;
  sort!: string;
  start: number;
  totalCount!: number;

  constructor() {
    this.start = 1;
    this.limit = 10;
  }
}
