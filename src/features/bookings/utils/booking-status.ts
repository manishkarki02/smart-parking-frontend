export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function getBookingStatusVariant(
  status: string,
  slotStatus?: string,
): BadgeVariant {
  if (slotStatus === "BOOKED" || slotStatus === "OCCUPIED") {
    return "secondary";
  }

  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "default";
    case "PENDING":
    case "CONFIRMED":
      return "secondary";
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

export function formatBookingStatus(
  status: string,
  slotStatus?: string,
): string {
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  if (slotStatus === "RESERVED") return "Reserved";
  if (slotStatus === "BOOKED") return "Booked";
  if (slotStatus === "OCCUPIED") return "Occupied";
  return status;
}
