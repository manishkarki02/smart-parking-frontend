import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  LogIn,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VendorBooking } from "@/features/bookings/services/booking.service";
import type { VendorBookingAction } from "@/features/bookings/types/booking.types";
import { VendorBookingDetailPanel } from "@/features/vendor/components/VendorBookingDetailPanel";
import { VendorBookingStatusBadge } from "@/features/vendor/components/VendorBookingStatusBadge";
import {
  canCheckIn,
  canComplete,
  formatAmount,
  formatDate,
  formatTime,
  getBookingId,
  getCustomerName,
  getCustomerPhone,
  getPaymentStatusVariant,
  getSlot,
  getSourceLabel,
} from "@/features/vendor/utils/vendor-booking.utils";
import { cn } from "@/lib/utils";

const headers = [
  "ID",
  "Customer",
  "Source",
  "Location",
  "Slot",
  "Time",
  "Amount",
  "Payment",
  "Status",
  "Action",
];

export function VendorBookingsTable({
  bookings,
  selectedBooking,
  selectedBookingId,
  filteredCount,
  currentPage,
  totalPages,
  isLoading,
  isError,
  isMutating,
  onSelectBooking,
  onCloseDetail,
  onAction,
  onPreviousPage,
  onNextPage,
}: {
  bookings: VendorBooking[];
  selectedBooking: VendorBooking | null;
  selectedBookingId: string | null;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  isMutating: boolean;
  onSelectBooking: (booking: VendorBooking) => void;
  onCloseDetail: () => void;
  onAction: (booking: VendorBooking, action: VendorBookingAction) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "grid min-w-0",
          selectedBooking
            ? "xl:grid-cols-[minmax(0,1fr)_360px]"
            : "grid-cols-1",
        )}
      >
        <div className="min-w-0">
          <div className="max-w-full overflow-x-auto">
            <Table className="min-w-[920px]">
              <TableHeader className="bg-slate-100/80">
                <TableRow className="hover:bg-transparent">
                  {headers.map((header) => (
                    <TableHead
                      key={header}
                      className="h-9 px-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableMessageRow message="Loading bookings..." />
                ) : isError ? (
                  <TableMessageRow message="Unable to load bookings." />
                ) : bookings.length === 0 ? (
                  <TableMessageRow message="No bookings found." />
                ) : (
                  bookings.map((booking) => (
                    <BookingTableRow
                      key={getBookingId(booking)}
                      booking={booking}
                      selected={getBookingId(booking) === selectedBookingId}
                      isMutating={isMutating}
                      onSelect={() => onSelectBooking(booking)}
                      onAction={onAction}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {selectedBooking ? (
          <VendorBookingDetailPanel
            booking={selectedBooking}
            isMutating={isMutating}
            onClose={onCloseDetail}
            onAction={onAction}
          />
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Showing {bookings.length} of {filteredCount} bookings
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={onPreviousPage}
          >
            <ChevronLeft className="size-4" />
            Prev
          </Button>
          <Button type="button" size="sm" className="w-9 px-0">
            {currentPage}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={onNextPage}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

function BookingTableRow({
  booking,
  selected,
  isMutating,
  onSelect,
  onAction,
}: {
  booking: VendorBooking;
  selected: boolean;
  isMutating: boolean;
  onSelect: () => void;
  onAction: (booking: VendorBooking, action: VendorBookingAction) => void;
}) {
  return (
    <TableRow
      data-state={selected ? "selected" : undefined}
      className="cursor-pointer border-slate-200 data-[state=selected]:bg-blue-50/80"
      onClick={onSelect}
    >
      <TableCell className="px-4 font-mono text-xs font-semibold text-slate-500">
        {getBookingId(booking).slice(0, 8)}
      </TableCell>
      <TableCell className="px-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {getCustomerName(booking)}
          </p>
          <p className="truncate font-mono text-xs text-slate-500">
            {getCustomerPhone(booking)}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-4">
        <SourceBadge booking={booking} />
      </TableCell>
      <TableCell className="max-w-38 px-4">
        <span className="block truncate text-sm font-medium text-slate-950">
          {booking.parkingLocationName ?? "-"}
        </span>
      </TableCell>
      <TableCell className="px-4">
        <SlotBadge booking={booking} />
      </TableCell>
      <TableCell className="px-4">
        <div className="min-w-30">
          <p className="text-xs font-bold text-slate-950">
            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatDate(booking.startTime)}
          </p>
        </div>
      </TableCell>
      <TableCell className="px-4 text-sm font-bold text-slate-950">
        {formatAmount(booking)}
      </TableCell>
      <TableCell className="px-4">
        <div className="flex flex-col items-start gap-1">
          <PaymentMethodBadge method={booking.paymentMethod} />
          <PaymentStatusBadge status={booking.paymentStatus} />
        </div>
      </TableCell>
      <TableCell className="px-4">
        <VendorBookingStatusBadge booking={booking} />
      </TableCell>
      <TableCell className="px-4">
        <div data-row-action="true" onClick={(event) => event.stopPropagation()}>
          {canCheckIn(booking) ? (
            <Button
              type="button"
              size="sm"
              disabled={isMutating}
              className="h-8 bg-blue-600 text-xs hover:bg-blue-700"
              onClick={() => onAction(booking, "CHECK_IN")}
            >
              <LogIn className="size-3.5" />
              Check in
            </Button>
          ) : null}
          {canComplete(booking) ? (
            <Button
              type="button"
              size="sm"
              disabled={isMutating}
              className="h-8 bg-green-600 text-xs hover:bg-green-700"
              onClick={() => onAction(booking, "COMPLETE")}
            >
              <CheckCircle2 className="size-3.5" />
              Complete
            </Button>
          ) : null}
          {!canCheckIn(booking) && !canComplete(booking) ? (
            booking.status === "COMPLETED" || booking.status === "CANCELLED" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled
                className="h-8 w-10 text-xs"
              >
                <Minus className="size-3.5" />
              </Button>
            ) : (
              <Button type="button" size="sm" variant="outline" className="h-8">
                <Eye className="size-3.5" />
                View
              </Button>
            )
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

function TableMessageRow({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell
        colSpan={10}
        className="h-52 px-4 text-center text-sm text-slate-500"
      >
        {message}
      </TableCell>
    </TableRow>
  );
}

function SourceBadge({ booking }: { booking: VendorBooking }) {
  const isWalkIn = booking.walkIn;
  return (
    <Badge
      className={cn(
        "border-0 px-2.5 py-1 text-xs font-bold shadow-none",
        isWalkIn
          ? "bg-purple-50 text-purple-700 hover:bg-purple-50"
          : "bg-blue-50 text-blue-700 hover:bg-blue-50",
      )}
    >
      {getSourceLabel(booking)}
    </Badge>
  );
}

function SlotBadge({ booking }: { booking: VendorBooking }) {
  const isFourWheeler = booking.vehicleType === "FOUR_WHEELER";
  return (
    <Badge
      className={cn(
        "border-0 px-2.5 py-1 font-mono text-xs font-bold shadow-none",
        isFourWheeler
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
          : "bg-blue-100 text-blue-700 hover:bg-blue-100",
      )}
    >
      {getSlot(booking)}
    </Badge>
  );
}

function PaymentMethodBadge({ method }: { method?: string | null }) {
  const normalized = method?.toUpperCase();
  return (
    <Badge
      className={cn(
        "border px-2.5 py-0.5 text-xs font-bold shadow-none",
        normalized === "CASH"
          ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-50"
          : "border-purple-200 bg-purple-700 text-white hover:bg-purple-700",
      )}
    >
      {normalized ?? "-"}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status?: string | null }) {
  const label =
    status?.toUpperCase() === "SUCCESS"
      ? "Paid"
      : status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : "-";
  return (
    <Badge className="w-fit" variant={getPaymentStatusVariant(status)}>
      {label}
    </Badge>
  );
}
