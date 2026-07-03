export interface PaginatedResult<TData> {
  data: TData[];
  totalPages: number;
  totalElements?: number;
  page?: number;
  size?: number;
}
