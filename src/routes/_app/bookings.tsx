import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "@/features/booking/services/booking.service";
import { BookingCard } from "@/features/booking/components/BookingCard";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { initiatePayment } from "@/features/payment/services/payment.service";
import type { BookingResponse } from "@/features/booking/types/booking.types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/bookings")({
  beforeLoad: () => {
    if (useAuthStore.getState().user?.role !== "DRIVER") {
      throw redirect({ to: "/" });
    }
  },
  component: BookingsPage,
});

function BookingsPage() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.booking.my,
    queryFn: getMyBookings,
  });

  const handlePay = async (booking: BookingResponse) => {
    try {
      const payment = await initiatePayment({
        bookingId: booking.bookingId,
        paymentMethod: "KHALTI",
      });

      if (payment.PaymentUrl) {
        window.open(payment.PaymentUrl, "_blank");
      } else {
        toast.info("Payment initiated. Transaction ID: " + payment.transactionId);
      }
    } catch {
      toast.error("Failed to initiate payment");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your parking bookings
          </p>
        </div>
        <Link to="/bookings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No bookings yet</p>
          <p className="text-sm">Create your first booking to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.bookingId}
              booking={booking}
              onPay={handlePay}
            />
          ))}
        </div>
      )}
    </div>
  );
}
