import { Button } from "@/components/ui/button";
import { MapIcon, Plus } from "lucide-react";
import { PageHeader } from "@/common/components/PageHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import { BookingForm } from "@/features/bookings/components/BookingForm";
import {
  DriverBookingDetailPanel,
  DriverBookingFilters,
  DriverBookingSummaryCards,
} from "@/features/bookings/components/driver/DriverBookingPageSections";
import {
  PaymentSuccessTicketDialog,
  type PaymentSuccessDetails,
} from "@/features/payments/components/PaymentSuccessTicketDialog";
import {
  DataTablePagination,
  SplitDataTable,
  TableEmptyState,
} from "@/common";
import {
  DRIVER_BOOKINGS_PAGE_SIZE,
} from "@/features/bookings/utils/driver-booking-page.utils";
import { useDriverBookingsPageState } from "@/features/bookings/hooks/useDriverBookingsPageState";

interface DriverBookingsPageProps {
  parkingLocationId?: string;
  payment?: PaymentSuccessDetails;
}

export function DriverBookingsPage({
  parkingLocationId,
  payment,
}: DriverBookingsPageProps) {
  const page = useDriverBookingsPageState({ parkingLocationId, payment });

  return (
    <>
      <PageHeader
        title="My Bookings"
        content={
          <div className="min-w-0 py-1">
            <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950">
              My Bookings
            </h1>
            <p className="truncate text-sm text-slate-500">
              Track your parking reservations and payment status
            </p>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 gap-2 bg-white shadow-none"
              onClick={page.openParkingMap}
            >
              <MapIcon className="size-4" />
              Find Parking
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={() => page.setIsAddBookingOpen(true)}
            >
              <Plus className="size-4" />
              Add Booking
            </Button>
          </div>
        }
      />

      <div className="mx-auto w-full max-w-7xl space-y-4">
        <DriverBookingSummaryCards
          bookings={page.bookings}
          loading={page.isLoading}
        />

        <SplitDataTable
          columns={page.tableColumns}
          compactColumns={page.compactTableColumns}
          rows={page.pagedBookings}
          getRowId={(booking) => booking.bookingId}
          selectedRowId={page.selectedBooking ? page.selectedBookingId : null}
          onRowSelect={page.selectBooking}
          onDetailClose={page.closeSelectedBooking}
          detailTitle={
            page.selectedBooking
              ? page.selectedBooking.parkingLocationName
              : "Booking details"
          }
          detailPanel={
            <DriverBookingDetailPanel
              booking={page.selectedBooking}
              onPay={page.handlePay}
              onCancel={page.setCancelBookingId}
              onReceipt={page.openReceipt}
              onNavigate={page.handleNavigateToParking}
              onClose={page.closeSelectedBooking}
            />
          }
          isLoading={page.isLoading}
          loadingRowCount={DRIVER_BOOKINGS_PAGE_SIZE}
          splitContainerClassName="min-h-0 items-stretch"
          emptyState={
            <TableEmptyState
              title={
                page.bookings.length === 0
                  ? "No bookings found"
                  : "No bookings match"
              }
              description={
                page.bookings.length === 0
                  ? "Your parking reservations will appear here after you book a slot."
                  : "Try adjusting the search, status, payment, or date filters."
              }
            />
          }
          toolbar={
            <DriverBookingFilters
              search={page.search}
              statusFilter={page.statusFilter}
              paymentFilter={page.paymentFilter}
              dateFilter={page.dateFilter}
              onSearchChange={page.setSearch}
              onStatusChange={page.setStatusFilter}
              onPaymentChange={page.setPaymentFilter}
              onDateChange={page.setDateFilter}
              onResetPage={page.resetPage}
            />
          }
          pagination={
            <DataTablePagination
              page={page.currentPage}
              pageSize={DRIVER_BOOKINGS_PAGE_SIZE}
              totalItems={page.visibleBookings.length}
              pageSizeOptions={[DRIVER_BOOKINGS_PAGE_SIZE]}
              onPageChange={page.setPage}
              onPageSizeChange={page.resetPage}
            />
          }
        />
      </div>

      <ConfirmDialog
        open={page.cancelBookingId !== null}
        onOpenChange={(open) => !open && page.setCancelBookingId(null)}
        title="Cancel this booking?"
        description="This action cannot be undone."
        confirmLabel="Cancel booking"
        onConfirm={() => {
          if (page.cancelBookingId) {
            page.cancelMutation.mutate(page.cancelBookingId);
          }
        }}
        isLoading={page.cancelMutation.isPending}
      />

      <Dialog
        open={page.isAddBookingDialogOpen}
        onOpenChange={page.handleAddBookingOpenChange}
      >
        <DialogContent
          className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-[560px]"
          showCloseButton
        >
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="text-lg font-bold text-slate-950">
              Add Booking
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Select a parking location, slot, vehicle, and booking time.
            </DialogDescription>
          </DialogHeader>

          <BookingForm
            variant="dialog"
            preselectedParkingId={parkingLocationId}
            navigateOnSuccess={false}
            onSuccess={page.closeAddBookingDialog}
          />
        </DialogContent>
      </Dialog>

      <PaymentSuccessTicketDialog
        open={page.isPaymentTicketOpen}
        payment={page.receiptPayment ?? payment ?? {}}
        booking={page.paidBooking}
        onOpenChange={(open) => {
          if (!open) {
            page.closePaymentTicket();
          }
        }}
      />
    </>
  );
}
