import { Button } from "@/components/ui/button";

interface DataTablePaginationProps {
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  if (page === undefined && totalPages === undefined && !onPageChange) {
    return null;
  }

  const currentPage = page ?? 1;
  const pageCount = totalPages ?? 1;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < pageCount;

  return (
    <div className="mt-4 flex items-center justify-end gap-3">
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {pageCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!onPageChange || !canGoPrevious}
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!onPageChange || !canGoNext}
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
