import { Card, CardContent } from "@/components/ui/card";
import { AddOnSiteBookingDialog } from "@/features/vendor/components/AddOnSiteBookingDialog";
import { VendorBookingSummaryCards } from "@/features/vendor/components/bookings/VendorBookingSummaryCards";
import { VendorBookingsTable } from "@/features/vendor/components/bookings/VendorBookingsTable";
import { VendorBookingsToolbar } from "@/features/vendor/components/bookings/VendorBookingsToolbar";
import { VendorBookingsPageHeader } from "@/features/vendor/components/VendorBookingsPageHeader";
import { useVendorBookingsPageState } from "@/features/vendor/hooks/useVendorBookingsPageState";

export function VendorBookingsPage() {
  const page = useVendorBookingsPageState();

  if (!page.isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-full min-w-0 overflow-x-hidden bg-slate-50">
      <VendorBookingsPageHeader
        locationId={page.locationId}
        locations={page.locations}
        onLocationChange={page.selectLocation}
        onAddBooking={() => page.setIsAddDialogOpen(true)}
      />

      <main className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
        <VendorBookingSummaryCards summary={page.summary} />

        <Card className="min-w-0 overflow-hidden border-slate-200 bg-white shadow-none">
          <CardContent className="p-0">
            <VendorBookingsToolbar
              search={page.search}
              statusFilter={page.statusFilter}
              paymentMethodFilter={page.paymentMethodFilter}
              onSearchChange={page.setSearchFilter}
              onStatusFilterChange={page.setStatus}
              onPaymentMethodFilterChange={page.setPaymentMethod}
              onResetFilters={page.resetFilters}
            />

            <VendorBookingsTable
              bookings={page.pagedBookings}
              selectedBooking={page.selectedBooking}
              selectedBookingId={page.selectedBookingId}
              filteredCount={page.filteredCount}
              currentPage={page.currentPage}
              totalPages={page.totalPages}
              isLoading={page.isLoading}
              isError={page.isError}
              isMutating={page.isMutating}
              onSelectBooking={page.selectBooking}
              onCloseDetail={page.closeSelectedBooking}
              onAction={page.runAction}
              onPreviousPage={page.previousPage}
              onNextPage={page.nextPage}
            />
          </CardContent>
        </Card>
      </main>

      <AddOnSiteBookingDialog
        open={page.isAddDialogOpen}
        onOpenChange={page.setIsAddDialogOpen}
      />
    </div>
  );
}
