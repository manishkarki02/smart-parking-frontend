import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyBookings } from "@/features/bookings/services/booking.service";
import { BookingCard } from "@/features/bookings/components/BookingCard";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { initiatePayment } from "@/features/payments/services/payment.service";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import { toast } from "sonner";
import { AppLayout } from "@/common/components/AppLayout";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";

export const Route = createFileRoute("/bookings/")({
  component: BookingsPage,
});

function BookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["DRIVER"] });
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.bookings.me(),
    queryFn: getMyBookings,
    enabled: isAuthorized,
  });

  if (!isAuthorized) {
    return null;
  }

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
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
      </div>
    </AppLayout>
  );
}
