export type VendorBookingStatusFilter =
  | "ALL"
  | "RESERVED"
  | "BOOKED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "PAYMENT_PENDING";

export type VendorBookingPaymentMethodFilter =
  | "ALL"
  | "CASH"
  | "KHALTI"
  | "ESEWA";

export type VendorBookingStatusView = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
};

export type VendorBookingSummary = {
  total: number;
  active: number;
  completed: number;
  revenue: number;
  completedHelper: string;
};
