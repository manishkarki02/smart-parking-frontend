import { Link } from "@tanstack/react-router";
import { MapPin, ReceiptText } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import { QueryErrorState } from "@/common/components/feedback/QueryErrorState";
import {
  DataTablePagination,
  SplitDataTable,
  TableEmptyState,
} from "@/common";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { Button } from "@/components/ui/button";
import {
  DriverPaymentDetailPanel,
  DriverPaymentsSkeleton,
  DriverPaymentSummaryCards,
  DriverPaymentToolbar,
} from "@/features/payments/components/driver/DriverPaymentHistorySections";
import {
  PaymentSuccessTicketDialog,
} from "@/features/payments/components/PaymentSuccessTicketDialog";
import { useDriverPaymentsPageState } from "@/features/payments/hooks/useDriverPaymentsPageState";
import {
  DRIVER_PAYMENT_PAGE_SIZE,
  toDriverReceiptBooking,
  toDriverReceiptPayment,
} from "@/features/payments/utils/driver-payment-page.utils";

export function DriverPaymentHistoryPage() {
  const page = useDriverPaymentsPageState();

  return (
    <>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <PageHeader
          title="Payment History"
          content={<DriverPaymentsHeaderContent />}
          action={<DriverPaymentsHeaderActions />}
        />

        {page.isLoading && !page.paymentPage ? (
          <DriverPaymentsSkeleton />
        ) : page.isError ? (
          <QueryErrorState
            title="Unable to load payment history"
            message={readPaymentErrorMessage(page.error)}
            isRetrying={page.isFetching}
            onRetry={() => void page.refetch()}
          />
        ) : (
          <>
            <DriverPaymentSummaryCards summary={page.summary} />

            <SplitDataTable
              columns={page.columns}
              compactColumns={page.compactColumns}
              rows={page.payments}
              getRowId={(payment) => payment.paymentId}
              selectedRowId={page.selectedPaymentId}
              onRowSelect={page.selectPayment}
              onDetailClose={page.closeDetail}
              detailTitle="Payment Detail"
              detailPanel={
                <DriverPaymentDetailPanel
                  payment={page.selectedPaymentDetail}
                  isLoading={page.isDetailLoading}
                  isError={page.isDetailError}
                  isActionPending={page.isPaymentActionPending}
                  onClose={page.closeDetail}
                  onPayNow={page.handlePayNow}
                  onReceiptClick={page.setReceiptPayment}
                  onViewBooking={page.handleViewBooking}
                />
              }
              isLoading={page.isLoading}
              loadingRowCount={6}
              splitContainerClassName="min-h-[560px]"
              emptyState={<DriverPaymentsEmptyState />}
              toolbar={
                <DriverPaymentToolbar
                  filters={page.filters}
                  onFiltersChange={page.updateFilters}
                />
              }
              pagination={
                <DataTablePagination
                  page={page.currentPage}
                  pageSize={DRIVER_PAYMENT_PAGE_SIZE}
                  totalItems={page.totalItems}
                  totalPages={page.totalPages}
                  pageSizeOptions={[DRIVER_PAYMENT_PAGE_SIZE]}
                  onPageChange={page.changePage}
                  onPageSizeChange={() => undefined}
                />
              }
            />
          </>
        )}
      </div>

      <PaymentSuccessTicketDialog
        open={Boolean(page.receiptPayment)}
        payment={
          page.receiptPayment ? toDriverReceiptPayment(page.receiptPayment) : {}
        }
        booking={
          page.receiptPayment
            ? toDriverReceiptBooking(page.receiptPayment)
            : undefined
        }
        onOpenChange={page.closeReceiptDialog}
      />
    </>
  );
}

function DriverPaymentsHeaderContent() {
  return (
    <div className="min-w-0">
      <p className="truncate text-lg font-semibold tracking-tight text-foreground">
        Payment History
      </p>
      <p className="hidden truncate text-xs text-muted-foreground sm:block">
        View all your parking payment transactions and receipts
      </p>
    </div>
  );
}

function DriverPaymentsHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" asChild>
        <Link to="/bookings">
          <ReceiptText className="size-4" aria-hidden="true" />
          My Bookings
        </Link>
      </Button>
      <Button asChild>
        <Link to="/parkings/map">
          <MapPin className="size-4" aria-hidden="true" />
          Find Parking
        </Link>
      </Button>
    </div>
  );
}

function DriverPaymentsEmptyState() {
  return (
    <TableEmptyState
      title="No payment history yet"
      description="Your parking payments will appear here after you book and pay for a slot."
      action={
        <Button asChild>
          <Link to="/parkings/map">Find Parking</Link>
        </Button>
      }
    />
  );
}

function readPaymentErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error);
  const readableMessage = Array.isArray(message) ? message.join(", ") : message;
  return readableMessage || "Please try again.";
}
