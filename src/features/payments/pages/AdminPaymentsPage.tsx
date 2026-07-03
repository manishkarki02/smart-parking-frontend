import { useMemo, useState } from "react";
import { CircleCheck, Clock, CreditCard, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DataTablePagination,
  SplitDataTable,
  TableEmptyState,
} from "@/common";
import { PageHeader } from "@/common/components/PageHeader";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { AdminPaymentDetailPanel } from "@/features/payments/components/AdminPaymentDetailPanel";
import {
  AdminPaymentFilters,
  type AdminPaymentFilterState,
} from "@/features/payments/components/AdminPaymentFilters";
import { AdminPaymentSummaryCard } from "@/features/payments/components/AdminPaymentSummaryCard";
import {
  adminPaymentCompactTableColumns,
  adminPaymentTableColumns,
} from "@/features/payments/components/AdminPaymentsTable";
import { AdminPaymentsPageSkeleton } from "@/features/payments/components/AdminPaymentsPageSkeleton";
import { useAdminPaymentDetail } from "@/features/payments/hooks/useAdminPaymentDetail";
import { useAdminPayments } from "@/features/payments/hooks/useAdminPayments";
import { useAdminPaymentSummary } from "@/features/payments/hooks/useAdminPaymentSummary";
import type {
  AdminPaymentListItem,
  AdminPaymentsQueryParams,
} from "@/features/payments/types/payment.types";
import {
  formatPaymentCurrency,
  type PaymentMethodFilter,
  type PaymentStatusFilter,
} from "@/features/payments/utils/payment.utils";

type SelectionState =
  | { mode: "auto" }
  | { mode: "closed" }
  | { mode: "selected"; id: string };

const DEFAULT_FILTERS: AdminPaymentFilterState = {
  search: "",
  status: "ALL",
  method: "ALL",
  fromDate: "",
  toDate: "",
};

const DEFAULT_PAGE_SIZE = 10;

export function AdminPaymentsPage() {
  const [filters, setFilters] = useState<AdminPaymentFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selection, setSelection] = useState<SelectionState>({ mode: "auto" });
  const listParams = useMemo(
    () => buildListParams(filters, page, pageSize),
    [filters, page, pageSize],
  );
  const summaryParams = useMemo(
    () => ({
      fromDate: filters.fromDate || undefined,
      toDate: filters.toDate || undefined,
    }),
    [filters.fromDate, filters.toDate],
  );
  const {
    data: summary,
    isLoading: isSummaryLoading,
  } = useAdminPaymentSummary(summaryParams);
  const {
    data: paymentPage,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useAdminPayments(listParams);
  const payments = paymentPage?.content ?? [];
  const selectedPaymentId = getSelectedPaymentId(payments, selection);
  const {
    data: selectedPaymentDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = useAdminPaymentDetail(selectedPaymentId);
  const headerContent = useMemo(
    () => (
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold tracking-tight text-foreground">
          Payments
        </p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">
          All payment records across the platform
        </p>
      </div>
    ),
    [],
  );

  function updateFilters(nextFilters: AdminPaymentFilterState) {
    setFilters(nextFilters);
    setPage(0);
    setSelection({ mode: "auto" });
  }

  if (isLoading && !paymentPage) {
    return (
      <>
        <PageHeader title="Payments" content={headerContent} />
        <AdminPaymentsPageSkeleton />
      </>
    );
  }

  if (isError) {
    const message = getApiErrorMessage(error);
    const readableMessage = Array.isArray(message) ? message.join(", ") : message;

    return (
      <>
        <PageHeader title="Payments" content={headerContent} />
        <Card className="rounded-lg border shadow-none">
          <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <RefreshCw className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">Could not load payments.</h1>
              <p className="max-w-md text-sm text-muted-foreground">
                {readableMessage || "Please try again."}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" content={headerContent} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminPaymentSummaryCard
          title="Total Revenue"
          value={
            isSummaryLoading
              ? "-"
              : formatPaymentCurrency(summary?.totalRevenue ?? 0)
          }
          description="From all successful payments"
          icon={CreditCard}
          tone="blue"
        />
        <AdminPaymentSummaryCard
          title="Successful"
          value={isSummaryLoading ? "-" : summary?.successfulCount ?? 0}
          description="Verified & confirmed"
          icon={CircleCheck}
          tone="green"
        />
        <AdminPaymentSummaryCard
          title="Pending"
          value={isSummaryLoading ? "-" : summary?.pendingCount ?? 0}
          description="Awaiting verification"
          icon={Clock}
          tone="orange"
        />
        <AdminPaymentSummaryCard
          title="Failed"
          value={isSummaryLoading ? "-" : summary?.failedCount ?? 0}
          description="Requires attention"
          icon={TriangleAlert}
          tone="red"
        />
      </section>

      <SplitDataTable
        columns={adminPaymentTableColumns}
        compactColumns={adminPaymentCompactTableColumns}
        rows={payments}
        getRowId={(payment) => payment.paymentId}
        selectedRowId={selectedPaymentId}
        onRowSelect={(payment) =>
          setSelection((current) =>
            current.mode === "selected" && current.id === payment.paymentId
              ? { mode: "closed" }
              : { mode: "selected", id: payment.paymentId },
          )
        }
        onDetailClose={() => setSelection({ mode: "closed" })}
        detailTitle="Payment detail"
        detailPanel={
          <AdminPaymentDetailPanel
            payment={selectedPaymentDetail}
            isLoading={isDetailLoading}
            isError={isDetailError}
            onClose={() => setSelection({ mode: "closed" })}
          />
        }
        isLoading={isLoading}
        emptyState={
          <TableEmptyState
            title="No payment records found"
            description="Try adjusting your search or filters."
          />
        }
        toolbar={
          <AdminPaymentFilters
            filters={filters}
            onFiltersChange={updateFilters}
          />
        }
        pagination={
          <DataTablePagination
            page={(paymentPage?.page ?? page) + 1}
            pageSize={pageSize}
            totalItems={paymentPage?.totalElements ?? 0}
            pageSizeOptions={[10, 20, 50]}
            onPageChange={(nextPage) => {
              setPage(nextPage - 1);
              setSelection({ mode: "auto" });
            }}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(0);
              setSelection({ mode: "auto" });
            }}
          />
        }
      />
    </div>
  );
}

function buildListParams(
  filters: AdminPaymentFilterState,
  page: number,
  size: number,
): AdminPaymentsQueryParams {
  return {
    search: filters.search.trim() || undefined,
    status: normalizeStatusFilter(filters.status),
    method: normalizeMethodFilter(filters.method),
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    page,
    size,
    sort: "paidAt,desc",
  };
}

function normalizeStatusFilter(
  status: PaymentStatusFilter,
): AdminPaymentsQueryParams["status"] {
  return status === "ALL" ? undefined : status;
}

function normalizeMethodFilter(
  method: PaymentMethodFilter,
): AdminPaymentsQueryParams["method"] {
  return method === "ALL" ? undefined : method;
}

function getSelectedPaymentId(
  payments: AdminPaymentListItem[],
  selection: SelectionState,
): string | null {
  if (selection.mode === "closed") {
    return null;
  }

  if (selection.mode === "selected") {
    return (
      payments.find((payment) => payment.paymentId === selection.id)
        ?.paymentId ?? payments[0]?.paymentId ?? null
    );
  }

  return payments[0]?.paymentId ?? null;
}
