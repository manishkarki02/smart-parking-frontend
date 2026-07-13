import {
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMediaQuery } from "@/common/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { TableEmptyState } from "../TableEmptyState";
import type { DataTableColumn } from "./table-types";

export type SplitDataTableProps<T> = {
  rows: T[];
  columns: DataTableColumn<T>[];
  compactColumns?: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  selectedRowId?: string | null;
  onRowSelect?: (row: T) => void;
  onDetailClose?: () => void;
  detailPanel?: ReactNode;
  detailTitle?: ReactNode;
  toolbar?: ReactNode;
  pagination?: ReactNode;
  isLoading?: boolean;
  error?: unknown;
  emptyState?: ReactNode;
  loadingRowCount?: number;
  rowClassName?: (row: T) => string;
  splitContainerClassName?: string;
};

function shouldIgnoreRowClick(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'button,a,input,select,textarea,[role="button"],[data-row-action="true"]',
    ),
  );
}

function getAlignClass(align?: DataTableColumn<unknown>["align"]) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function getVisibleColumns<T>({
  columns,
  compactColumns,
  isSplit,
  isDesktop,
}: {
  columns: DataTableColumn<T>[];
  compactColumns?: DataTableColumn<T>[];
  isSplit: boolean;
  isDesktop: boolean;
}) {
  if (!isSplit || !isDesktop) return columns;
  if (compactColumns && compactColumns.length > 0) return compactColumns;
  return columns;
}

function DataTableCard<T>({
  rows,
  columns,
  getRowId,
  selectedRowId,
  onRowSelect,
  isLoading,
  error,
  emptyState,
  loadingRowCount,
  rowClassName,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  selectedRowId?: string | null;
  onRowSelect?: (row: T) => void;
  isLoading?: boolean;
  error?: unknown;
  emptyState?: ReactNode;
  loadingRowCount: number;
  rowClassName?: (row: T) => string;
}) {
  const columnCount = Math.max(columns.length, 1);

  function handleRowClick(event: MouseEvent<HTMLTableRowElement>, row: T) {
    if (shouldIgnoreRowClick(event.target)) return;
    onRowSelect?.(row);
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/60">
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    "whitespace-nowrap text-muted-foreground",
                    getAlignClass(column.align),
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
                <TableRow key={`loading-${rowIndex}`}>
                  {columns.map((column, cellIndex) => (
                    <TableCell
                      key={`${column.id}-${cellIndex}`}
                      className={cn(getAlignClass(column.align), column.className)}
                    >
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {error && !isLoading ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-32 text-center">
                  <span className="text-sm text-destructive">
                    Failed to load data.
                  </span>
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !error && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="p-0 whitespace-normal">
                  {emptyState ?? (
                    <TableEmptyState
                      title="No results found"
                      description="Try adjusting your search or filters."
                    />
                  )}
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading &&
              !error &&
              rows.map((row) => {
                const rowId = getRowId(row);
                const isSelected = rowId === selectedRowId;

                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      onRowSelect && "cursor-pointer",
                      "hover:bg-muted/50",
                      isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/20",
                      rowClassName?.(row),
                    )}
                    onClick={(event) => handleRowClick(event, row)}
                  >
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          "align-middle",
                          getAlignClass(column.align),
                          column.className,
                        )}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function clampSplitWidth(value: number) {
  return Math.min(80, Math.max(20, value));
}

export function SplitDataTable<T>({
  rows,
  columns,
  compactColumns,
  getRowId,
  selectedRowId,
  onRowSelect,
  onDetailClose,
  detailPanel,
  detailTitle,
  toolbar,
  pagination,
  isLoading = false,
  error,
  emptyState,
  loadingRowCount = 5,
  rowClassName,
  splitContainerClassName,
}: SplitDataTableProps<T>) {
  const [tableWidth, setTableWidth] = useState(60);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const hasDetail = Boolean(selectedRowId && detailPanel);
  const visibleColumns = getVisibleColumns({
    columns,
    compactColumns,
    isSplit: hasDetail,
    isDesktop,
  });

  const table = (
    <DataTableCard
      rows={rows}
      columns={visibleColumns.length > 0 ? visibleColumns : columns}
      getRowId={getRowId}
      selectedRowId={selectedRowId}
      onRowSelect={onRowSelect ? handleRowSelect : undefined}
      isLoading={isLoading}
      error={error}
      emptyState={emptyState}
      loadingRowCount={loadingRowCount}
      rowClassName={rowClassName}
    />
  );

  function startResize(event: ReactPointerEvent<HTMLDivElement>) {
    const container = event.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    function handlePointerMove(pointerEvent: PointerEvent) {
      const nextWidth =
        ((pointerEvent.clientX - rect.left) / rect.width) * 100;
      setTableWidth(clampSplitWidth(nextWidth));
    }

    function handlePointerUp() {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    event.preventDefault();
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function handleRowSelect(row: T) {
    setTableWidth(60);
    onRowSelect?.(row);
  }

  return (
    <div className="w-full space-y-4">
      {toolbar}

      {hasDetail && isDesktop ? (
        <div
          className={cn(
            "flex min-h-155 w-full overflow-hidden rounded-lg",
            splitContainerClassName,
          )}
        >
          <div
            className="h-full min-w-0 shrink-0 overflow-hidden pr-4"
            style={{ width: `${tableWidth}%` }}
          >
            {table}
          </div>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-valuemin={20}
            aria-valuemax={80}
            aria-valuenow={Math.round(tableWidth)}
            tabIndex={0}
            className="relative flex w-px shrink-0 cursor-col-resize touch-none items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            onPointerDown={startResize}
          >
            <div className="z-10 flex h-5 w-3 items-center justify-center rounded-xs border bg-border">
              <span className="h-3 w-0.5 rounded-full bg-muted-foreground/70" />
            </div>
          </div>
          <div
            className="h-full min-w-0 shrink-0 overflow-hidden pl-4"
            style={{ width: `${100 - tableWidth}%` }}
          >
            {detailPanel}
          </div>
        </div>
      ) : (
        <div className="min-w-0 basis-full transition-all duration-200">
          {table}
        </div>
      )}

      {pagination}

      <Sheet
        open={hasDetail && !isDesktop}
        onOpenChange={(open) => {
          if (!open) onDetailClose?.();
        }}
      >
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {detailTitle ? (
            <SheetHeader>
              <SheetTitle>{detailTitle}</SheetTitle>
            </SheetHeader>
          ) : null}
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-0">
            {detailPanel}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
