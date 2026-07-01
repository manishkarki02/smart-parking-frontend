import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DataTablePaginationProps = {
  page: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function DataTablePagination({
  page,
  pageSize,
  totalItems,
  totalPages,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const pageCount = totalPages ?? Math.max(1, Math.ceil((totalItems ?? 0) / pageSize));
  const firstItem = totalItems && totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
  const lastItem = totalItems
    ? Math.min(page * pageSize, totalItems)
    : page * pageSize;

  return (
    <div className="flex flex-col gap-3 border-t p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <div>
        {totalItems !== undefined
          ? `${firstItem}-${lastItem} of ${totalItems}`
          : `Page ${page} of ${pageCount}`}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span>Rows</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-9 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>
          <span className="rounded-md bg-muted px-3 py-1.5 text-foreground">
            {page}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
