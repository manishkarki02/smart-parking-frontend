import type { BookingResponse } from "../types/booking.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarCheck, Clock, DollarSign } from "lucide-react";

interface BookingCardProps {
  booking: BookingResponse;
  onPay?: (booking: BookingResponse) => void;
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
      return "default";
    case "PENDING":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function BookingCard({ booking, onPay }: BookingCardProps) {
  return (
    <Card className="group overflow-hidden border bg-card/60 backdrop-blur-sm sm:hover:scale-[1.02] hover:shadow-xl hover:border-primary/30 transition-all duration-300">
      <CardHeader className="pb-3 bg-muted/20 border-b">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{booking.parkingName}</CardTitle>
          <Badge variant={getStatusVariant(booking.status)} className="shadow-sm">
            {booking.status}
          </Badge>
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
            {formatDateTime(booking.startTime)} –{" "}
            {formatDateTime(booking.endTime)}
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

        {onPay && booking.status?.toUpperCase() === "CONFIRMED" && (
          <Button
            className="w-full mt-4 font-semibold group-hover:bg-primary transition-colors"
            size="default"
            onClick={() => onPay(booking)}
          >
            Pay Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
