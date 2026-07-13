import { Badge } from "@/components/ui/badge";
import type { VendorBooking } from "@/features/bookings/services/booking.service";
import { getOperationalStatus } from "@/features/vendor/utils/vendor-booking.utils";

export function VendorBookingStatusBadge({
  booking,
}: {
  booking: VendorBooking;
}) {
  const status = getOperationalStatus(booking);
  return <Badge variant={status.variant}>{status.label}</Badge>;
}
