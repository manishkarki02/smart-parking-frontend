import { createFileRoute, Link } from "@tanstack/react-router";
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
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import {
  SplitDataTable,
  SplitDetailPanel,
  TableEmptyState,
  TableToolbar,
  type DataTableColumn,
} from "@/common";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import useCustomMutation from "@/common/hooks/useCustomMutation";

export const Route = createFileRoute("/bookings/")({
  component: BookingsPage,
});

function BookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["DRIVER"] });
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.bookings.me(),
    queryFn: getMyBookings,
    enabled: isAuthorized,
  });

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
      visibleBookings.find((booking) => booking.bookingId === selectedBookingId) ??
      null,
    [visibleBookings, selectedBookingId],
  );

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
            {formatTime(booking.startTime)}-{formatTime(booking.endTime)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDate(booking.startTime)}
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
        <Badge variant={getStatusVariant(booking.status, booking.slotStatus)}>
          {formatStatus(booking.status, booking.slotStatus)}
        </Badge>
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
             <h1 className="text-3xl font-bold tracking-tight text-foreground">My Bookings</h1>
             <p className="text-muted-foreground mt-1">View and manage your parking reservations</p>
          </div>
          <Button asChild size="lg" className="rounded-full shadow-sm">
            <Link to="/bookings/new">
              <Plus className="mr-2 h-5 w-5" />
              New Booking
            </Link>
          </Button>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-6 md:p-8 min-h-[50vh] shadow-sm">
          {isLoading ? (
             <div className="flex justify-center items-center h-40">
                <LoadingSpinner />
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
                bookings.length === 0 ? (
                  <TableEmptyState
                    title="No active bookings"
                    description="You haven't made any parking reservations yet. Find a spot to get started."
                    action={
                      <Button variant="outline" className="rounded-full" asChild>
                        <Link to="/">Explore Locations</Link>
                      </Button>
                    }
                  />
                ) : (
                  <TableEmptyState
                    title="No bookings found"
                    description="Try adjusting your search to find a reservation."
                  />
                )
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
          <InfoItem label="Vehicle type" value={formatVehicleType(booking.vehicleType)} />
          <InfoItem label="Amount" value={`Rs. ${Number(booking.totalAmount).toFixed(2)}`} />
          <InfoItem label="Payment" value={booking.paymentStatus ?? "-"} />
        </section>
        <section className="rounded-lg border p-3">
          <h3 className="text-sm font-medium">Status</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant={getStatusVariant(booking.status, booking.slotStatus)}>
              {formatStatus(booking.status, booking.slotStatus)}
            </Badge>
            {booking.slotStatus ? (
              <Badge variant="outline">{booking.slotStatus}</Badge>
            ) : null}
          </div>
        </section>
        <section className="grid gap-3 sm:grid-cols-2">
          <InfoItem label="Start" value={`${formatDate(booking.startTime)} ${formatTime(booking.startTime)}`} />
          <InfoItem label="End" value={`${formatDate(booking.endTime)} ${formatTime(booking.endTime)}`} />
          <InfoItem label="Payment method" value={booking.paymentMethod ?? "-"} />
          <InfoItem label="Paid at" value={booking.paidAt ? `${formatDate(booking.paidAt)} ${formatTime(booking.paidAt)}` : "-"} />
        </section>
        <div className="flex flex-wrap gap-2 border-t pt-4">{actions}</div>
      </div>
    </SplitDetailPanel>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 wrap-break-word text-sm font-medium">{value}</div>
    </div>
  );
}

function formatVehicleType(vehicleType?: string): string {
  if (vehicleType === "TWO_WHEELER") return "Two wheeler";
  if (vehicleType === "FOUR_WHEELER") return "Four wheeler";
  return "-";
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: string, slotStatus?: string): string {
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  if (slotStatus === "RESERVED") return "Reserved";
  if (slotStatus === "BOOKED") return "Booked";
  if (slotStatus === "OCCUPIED") return "Occupied";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

function getStatusVariant(
  status: string,
  slotStatus?: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toUpperCase()) {
    case "COMPLETED":
      return "default";
    case "CANCELLED":
      return "destructive";
    default:
      return slotStatus === "BOOKED" || slotStatus === "OCCUPIED"
        ? "secondary"
        : "outline";
  }
}
