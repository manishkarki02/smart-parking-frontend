import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import { DataTableToolbar } from "./DataTableToolbar";
import { DataTablePagination } from "./DataTablePagination";

export interface ColumnDef<TData> {
  key: string;
  header: string;
  cell: (row: TData) => ReactNode;
  className?: string;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  heading?: string;
  subheading?: string;
  actions?: ReactNode;
  rowActions?: (row: TData) => ReactNode;
  emptyMessage?: string;
}

function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  page,
  totalPages,
  onPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  heading,
  subheading,
  actions,
  rowActions,
  emptyMessage = "No results found",
}: DataTableProps<TData>) {
  const columnCount = columns.length + (rowActions ? 1 : 0);

  return (
    <div>
      {heading && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
            {subheading && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {subheading}
              </p>
            )}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      )}

      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={cn(column.className)}>
                  {column.header}
                </TableHead>
              ))}
              {rowActions && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={`loading-${rowIndex}`}>
                  {Array.from({ length: columnCount }).map((__, cellIndex) => (
                    <TableCell key={`loading-${rowIndex}-${cellIndex}`}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading &&
              data.length > 0 &&
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={cn(column.className)}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {rowActions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}

            {!isLoading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <Empty className="border-0 py-10">
                    <EmptyDescription>{emptyMessage}</EmptyDescription>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}

export default DataTable;
