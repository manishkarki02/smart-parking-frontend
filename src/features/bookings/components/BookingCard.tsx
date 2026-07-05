import type { BookingResponse } from "../types/booking.types";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck, Clock, DollarSign } from "lucide-react";
import { queryKeys } from "@/config/query-keys";
import { cancelBooking } from "../services/booking.service";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { formatBookingDateTimeLong } from "../utils/booking-formatters";

interface BookingCardProps {
  booking: BookingResponse;
  onPay?: (booking: BookingResponse) => void;
}

export function BookingCard({ booking, onPay }: BookingCardProps) {
  const queryClient = useQueryClient();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const canCancel = ["PENDING", "CONFIRMED"].includes(booking.status?.toUpperCase());

  const cancelMutation = useCustomMutation({
    api: cancelBooking,
    onSuccess: () => {
      setIsCancelDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.me() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.detail(booking.parkingLocationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.slots(booking.parkingLocationId),
      });
      toast.success("Booking cancelled successfully");
    },
    onError: () => {
      toast.error("Failed to cancel booking");
    },
  });

  return (
    <>
      <Card className="group overflow-hidden border bg-card/60 backdrop-blur-sm sm:hover:scale-[1.02] hover:shadow-xl hover:border-primary/30 transition-all duration-300">
        <CardHeader className="pb-3 bg-muted/20 border-b">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{booking.parkingLocationName}</CardTitle>
            <BookingStatusBadge
              status={booking.status}
              slotStatus={booking.slotStatus}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <div className="bg-primary/10 p-1.5 rounded-md text-primary">
               <CalendarCheck className="h-4 w-4" />
            </div>
            <span className="font-medium">Booking #{booking.bookingId}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-foreground/80">
            <div className="bg-primary/10 p-1.5 rounded-md text-primary">
               <Clock className="h-4 w-4" />
            </div>
            <span>
              {formatBookingDateTimeLong(booking.startTime)} –{" "}
              {formatBookingDateTimeLong(booking.endTime)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium">
            <div className="bg-green-100 dark:bg-green-900/40 p-1.5 rounded-md text-green-600 dark:text-green-400">
               <DollarSign className="h-4 w-4" />
            </div>
            <span className="text-base text-green-700 dark:text-green-400">Rs. {booking.totalAmount.toFixed(2)}</span>
          </div>

          {booking.message && (
            <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3 mt-3">
              {booking.message}
            </p>
          )}

          <div className="space-y-2 pt-1">
            {onPay &&
              (booking.status?.toUpperCase() === "PENDING" ||
                booking.slotStatus === "RESERVED") && (
              <Button
                className="w-full font-semibold group-hover:bg-primary transition-colors"
                size="default"
                onClick={() => onPay(booking)}
              >
                Pay Now
              </Button>
            )}
            {canCancel && (
              <Button
                type="button"
                className="w-full"
                variant="destructive"
                onClick={() => setIsCancelDialogOpen(true)}
              >
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        title="Cancel this booking?"
        description="This action cannot be undone."
        confirmLabel="Cancel booking"
        onConfirm={() => cancelMutation.mutate(booking.bookingId)}
        isLoading={cancelMutation.isPending}
      />
    </>
  );
}
