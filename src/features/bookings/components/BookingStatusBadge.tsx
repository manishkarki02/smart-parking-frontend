import { Badge } from "@/components/ui/badge";
import {
  formatBookingStatus,
  getBookingStatusVariant,
} from "@/features/bookings/utils/booking-status";

interface BookingStatusBadgeProps {
  status: string;
  slotStatus?: string;
}

export function BookingStatusBadge({
  status,
  slotStatus,
}: BookingStatusBadgeProps) {
  return (
    <Badge variant={getBookingStatusVariant(status, slotStatus)}>
      {formatBookingStatus(status, slotStatus)}
    </Badge>
  );
}
