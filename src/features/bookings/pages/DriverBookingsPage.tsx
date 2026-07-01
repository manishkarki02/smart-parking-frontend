import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelBooking,
  getMyBookings,
} from "@/features/bookings/services/booking.service";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { initiatePayment } from "@/features/payments/services/payment.service";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import { toast } from "sonner";
import { AppLayout } from "@/common/components/AppLayout";
import { PageHeader } from "@/common/components/PageHeader";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import {
  InfoItem,
  SplitDataTable,
  SplitDetailPanel,
  TableToolbar,
  type DataTableColumn,
} from "@/common";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { BookingForm } from "@/features/bookings/components/BookingForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingStatusBadge } from "@/features/bookings/components/BookingStatusBadge";
import {
  formatBookingDate,
  formatBookingDateTime,
  formatBookingTime,
  formatVehicleType,
} from "@/features/bookings/utils/booking-formatters";
import {
  PaymentSuccessTicketDialog,
  type PaymentSuccessDetails,
} from "@/features/payments/components/PaymentSuccessTicketDialog";

interface DriverBookingsPageProps {
  parkingLocationId?: string;
  payment?: PaymentSuccessDetails;
}

export function DriverBookingsPage({
  parkingLocationId,
  payment,
}: DriverBookingsPageProps) {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["DRIVER"] });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const isAddBookingDialogOpen = Boolean(parkingLocationId) || isAddBookingOpen;

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.bookings.me(),
    queryFn: getMyBookings,
    enabled: isAuthorized,
  });

  const closeAddBookingDialog = () => {
    setIsAddBookingOpen(false);

    if (parkingLocationId) {
      void navigate({ to: "/bookings", search: {} });
    }
  };

  const handleAddBookingOpenChange = (open: boolean) => {
    if (open) {
      setIsAddBookingOpen(true);
      return;
    }

    closeAddBookingDialog();
  };

  const cancelMutation = useCustomMutation({
    api: cancelBooking,
    onSuccess: () => {
      setCancelBookingId(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.me() });
      toast.success("Booking cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });

  const handlePay = async (booking: BookingResponse) => {
    try {
      const payment = await initiatePayment({
        bookingId: booking.bookingId,
        paymentMethod: "KHALTI",
      });

      if (payment.paymentUrl) {
        window.open(payment.paymentUrl, "_blank");
      } else {
        toast.info("Payment initiated. Transaction ID: " + payment.transactionId);
      }
    } catch {
      toast.error("Failed to initiate payment");
    }
  };

  const visibleBookings = bookings.filter((booking) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;

    return [
      booking.bookingId,
      booking.customerName,
      booking.customerPhone,
      booking.driverName,
      booking.parkingLocationName,
      booking.slotNumber,
      booking.slotStatus,
      booking.status,
      booking.vehicleNumber,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword));
  });

  const selectedBooking = useMemo(
    () =>
      visibleBookings.find(
        (booking) => booking.bookingId === selectedBookingId,
      ) ?? null,
    [visibleBookings, selectedBookingId],
  );
  const paidBooking = useMemo(
    () =>
      payment?.bookingId
        ? bookings.find((booking) => booking.bookingId === payment.bookingId)
        : undefined,
    [bookings, payment?.bookingId],
  );
  const isPaymentTicketOpen = Boolean(payment?.paymentSuccess);

  const closePaymentTicket = () => {
    void navigate({ to: "/bookings", search: {} });
  };

  const renderBookingActions = (booking: BookingResponse) => {
    const status = booking.status.toUpperCase();
    const slotStatus = booking.slotStatus?.toUpperCase();

    return (
      <div data-row-action="true" className="flex flex-wrap items-center gap-2">
        {(status === "PENDING" || slotStatus === "RESERVED") && (
          <Button type="button" size="sm" onClick={() => void handlePay(booking)}>
            Pay
          </Button>
        )}
        {(status === "PENDING" || status === "CONFIRMED") && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => setCancelBookingId(booking.bookingId)}
          >
            Cancel
          </Button>
        )}
        {status !== "PENDING" && status !== "CONFIRMED" && (
          <span className="text-muted-foreground">-</span>
        )}
      </div>
    );
  };

  const columns: DataTableColumn<BookingResponse>[] = [
    {
      id: "bookingId",
      header: "ID",
      className: "font-mono",
      cell: (booking) => `${booking.bookingId.slice(0, 8)}...`,
      compact: true,
    },
    {
      id: "customer",
      header: "Driver",
      cell: (booking) => (
        <div>
          <p className="font-medium">
            {booking.customerName ?? booking.driverName ?? "Driver booking"}
          </p>
          <p className="text-xs text-muted-foreground">
            {booking.customerPhone ?? booking.vehicleNumber ?? "No phone"}
          </p>
        </div>
      ),
      compact: true,
    },
    {
      id: "location",
      header: "Location",
      cell: (booking) => (
        <span className="rounded-md border bg-muted/30 px-2 py-1 text-sm">
          {booking.parkingLocationName}
        </span>
      ),
    },
    {
      id: "slot",
      header: "Slot",
      cell: (booking) => (
        <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-semibold text-primary">
          {booking.slotNumber}
        </span>
      ),
    },
    {
      id: "time",
      header: "Time",
      cell: (booking) => (
        <div>
          <p className="font-medium">
            {formatBookingTime(booking.startTime)}-
            {formatBookingTime(booking.endTime)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatBookingDate(booking.startTime)}
          </p>
        </div>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      cell: (booking) => `Rs. ${Number(booking.totalAmount).toFixed(2)}`,
    },
    {
      id: "status",
      header: "Status",
      cell: (booking) => (
        <BookingStatusBadge
          status={booking.status}
          slotStatus={booking.slotStatus}
        />
      ),
      compact: true,
    },
    {
      id: "actions",
      header: "Actions",
      cell: renderBookingActions,
      compact: true,
    },
  ];

  if (!isAuthorized) {
    return null;
  }

  return (
    <AppLayout>
      <PageHeader
        title="My Bookings"
        action={
          <Button type="button" onClick={() => setIsAddBookingOpen(true)}>
            <Plus className="mr-2 size-4" />
            Add booking
          </Button>
        }
      />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6 md:p-8 min-h-[50vh] shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner />
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground w-full max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">
                No active bookings
              </p>
              <p className="text-sm">
                You haven't made any parking reservations yet. Find a spot to
                get started.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button type="button" onClick={() => setIsAddBookingOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Add booking
                </Button>
                <Button variant="outline" className="rounded-full" asChild>
                  <Link to="/">Explore Locations</Link>
                </Button>
              </div>
            </div>
          ) : (
            <SplitDataTable
              columns={columns}
              rows={visibleBookings}
              getRowId={(booking) => booking.bookingId}
              selectedRowId={selectedBookingId}
              onRowSelect={(booking) =>
                setSelectedBookingId((current) =>
                  current === booking.bookingId ? null : booking.bookingId,
                )
              }
              onDetailClose={() => setSelectedBookingId(null)}
              detailTitle="Booking details"
              detailPanel={
                selectedBooking ? (
                  <DriverBookingDetailPanel
                    booking={selectedBooking}
                    onClose={() => setSelectedBookingId(null)}
                    actions={renderBookingActions(selectedBooking)}
                  />
                ) : null
              }
              emptyState={
                <Empty className="border-0 py-10">
                  <EmptyDescription>No bookings found.</EmptyDescription>
                </Empty>
              }
              toolbar={
                <TableToolbar
                  left={
                    <div className="relative max-w-sm">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setSelectedBookingId(null);
                        }}
                        placeholder="Search bookings..."
                        className="pl-9"
                      />
                    </div>
                  }
                />
              }
            />
          )}
        </div>
      </div>

      <Dialog
        open={isAddBookingDialogOpen}
        onOpenChange={handleAddBookingOpenChange}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Add booking</DialogTitle>
            <DialogDescription>
              Select a parking location, slot, vehicle, and booking time.
            </DialogDescription>
          </DialogHeader>

          <BookingForm
            variant="dialog"
            preselectedParkingId={parkingLocationId}
            navigateOnSuccess={false}
            onSuccess={closeAddBookingDialog}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={cancelBookingId !== null}
        onOpenChange={(open) => !open && setCancelBookingId(null)}
        title="Cancel this booking?"
        description="This action cannot be undone."
        confirmLabel="Cancel booking"
        onConfirm={() => {
          if (cancelBookingId) {
            cancelMutation.mutate(cancelBookingId);
          }
        }}
        isLoading={cancelMutation.isPending}
      />

      <PaymentSuccessTicketDialog
        open={isPaymentTicketOpen}
        payment={payment ?? {}}
        booking={paidBooking}
        onOpenChange={(open) => {
          if (!open) {
            closePaymentTicket();
          }
        }}
      />
    </AppLayout>
  );
}

function DriverBookingDetailPanel({
  booking,
  onClose,
  actions,
}: {
  booking: BookingResponse;
  onClose: () => void;
  actions: React.ReactNode;
}) {
  return (
    <SplitDetailPanel
      title={booking.parkingLocationName}
      subtitle={booking.bookingId}
      onClose={onClose}
    >
      <div className="space-y-4">
        <section className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="Location" value={booking.parkingLocationName} />
          <InfoItem label="Slot" value={booking.slotNumber} />
          <InfoItem label="Vehicle" value={booking.vehicleNumber ?? "-"} />
          <InfoItem
            label="Vehicle type"
            value={formatVehicleType(booking.vehicleType)}
          />
          <InfoItem
            label="Amount"
            value={`Rs. ${Number(booking.totalAmount).toFixed(2)}`}
          />
          <InfoItem label="Payment" value={booking.paymentStatus ?? "-"} />
        </section>

        <section className="rounded-lg border p-3">
          <h3 className="text-sm font-medium">Status</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <BookingStatusBadge
              status={booking.status}
              slotStatus={booking.slotStatus}
            />
            {booking.slotStatus ? (
              <Badge variant="outline">{booking.slotStatus}</Badge>
            ) : null}
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <InfoItem
            label="Start"
            value={formatBookingDateTime(booking.startTime)}
          />
          <InfoItem
            label="End"
            value={formatBookingDateTime(booking.endTime)}
          />
          <InfoItem
            label="Payment method"
            value={booking.paymentMethod ?? "-"}
          />
          <InfoItem
            label="Paid at"
            value={
              booking.paidAt
                ? formatBookingDateTime(booking.paidAt)
                : "-"
            }
          />
        </section>

        <div className="flex flex-wrap gap-2 border-t pt-4">{actions}</div>
      </div>
    </SplitDetailPanel>
  );
}
