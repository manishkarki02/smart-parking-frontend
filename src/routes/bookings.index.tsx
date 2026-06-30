import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelBooking,
  getMyBookings,
} from "@/features/bookings/services/booking.service";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { initiatePayment } from "@/features/payments/services/payment.service";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import { toast } from "sonner";
import { AppLayout } from "@/common/components/AppLayout";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import DataTable, { type ColumnDef } from "@/common/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import useCustomMutation from "@/common/hooks/useCustomMutation";

export const Route = createFileRoute("/bookings/")({
  component: BookingsPage,
});

function BookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["DRIVER"] });
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.bookings.me(),
    queryFn: getMyBookings,
    enabled: isAuthorized,
  });

  if (!isAuthorized) {
    return null;
  }

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

  const columns: ColumnDef<BookingResponse>[] = [
    {
      key: "bookingId",
      header: "ID",
      className: "font-mono",
      cell: (booking) => `${booking.bookingId.slice(0, 8)}...`,
    },
    {
      key: "customer",
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
    },
    {
      key: "location",
      header: "Location",
      cell: (booking) => (
        <span className="rounded-md border bg-muted/30 px-2 py-1 text-sm">
          {booking.parkingLocationName}
        </span>
      ),
    },
    {
      key: "slot",
      header: "Slot",
      cell: (booking) => (
        <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-semibold text-primary">
          {booking.slotNumber}
        </span>
      ),
    },
    {
      key: "time",
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
      key: "amount",
      header: "Amount",
      cell: (booking) => `Rs. ${Number(booking.totalAmount).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      cell: (booking) => (
        <Badge variant={getStatusVariant(booking.status, booking.slotStatus)}>
          {formatStatus(booking.status, booking.slotStatus)}
        </Badge>
      ),
    },
  ];

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
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground w-full max-w-md mx-auto text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                 <Plus className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">No active bookings</p>
              <p className="text-sm">You haven't made any parking reservations yet. Find a spot to get started.</p>
              <Button variant="outline" className="mt-6 rounded-full" asChild>
                 <Link to="/">Explore Locations</Link>
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={visibleBookings}
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search bookings..."
              emptyMessage="No bookings found"
              rowActions={(booking) => {
                const status = booking.status.toUpperCase();
                const slotStatus = booking.slotStatus?.toUpperCase();
                return (
                  <>
                    {(status === "PENDING" || slotStatus === "RESERVED") && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void handlePay(booking)}
                      >
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
                  </>
                );
              }}
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
