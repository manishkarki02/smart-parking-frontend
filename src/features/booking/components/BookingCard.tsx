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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{booking.parkingName}</CardTitle>
          <Badge variant={getStatusVariant(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarCheck className="h-4 w-4" />
          <span>Booking #{booking.bookingId}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>
            {formatDateTime(booking.startTime)} –{" "}
            {formatDateTime(booking.endTime)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium">
          <DollarSign className="h-4 w-4" />
          <span>Rs. {booking.totalAmount.toFixed(2)}</span>
        </div>

        {booking.message && (
          <p className="text-sm text-muted-foreground italic">
            {booking.message}
          </p>
        )}

        {onPay && booking.status?.toUpperCase() === "CONFIRMED" && (
          <Button
            className="w-full mt-2"
            size="sm"
            onClick={() => onPay(booking)}
          >
            Pay Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
