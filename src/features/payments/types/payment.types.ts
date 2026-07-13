export interface PaymentRequest {
  bookingId: string;
  paymentMethod: "KHALTI" | "CASH";
}

export interface PaymentResponse {
  paymentId: string;
  bookingId: string;
  amount: number;
  status: string;
  transactionId: string;
  paymentUrl?: string;
  paidAt: string;
  message: string;
  pidx: string;
}

export type PaymentStatus = "SUCCESS" | "PENDING" | "FAILED";

export type PaymentMethod = "KHALTI" | "CASH" | "ESEWA";

export type BookingSource = "ONLINE" | "WALK_IN";

export type VehicleType = "TWO_WHEELER" | "FOUR_WHEELER";

export type CustomerRole = "DRIVER" | "VENDOR" | "ADMIN" | "WALK_IN";

export type AdminPaymentSummaryParams = {
  fromDate?: string;
  toDate?: string;
};

export type AdminPaymentSummaryResponse = {
  totalRevenue: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
};

export type AdminPaymentsQueryParams = {
  search?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  fromDate?: string;
  toDate?: string;
  page: number;
  size: number;
  sort?: string;
};

export type AdminPaymentListItem = {
  paymentId: string;
  bookingId: string;
  customerName: string;
  customerPhone?: string;
  customerRole?: CustomerRole;
  parkingLocationName?: string;
  slotCode?: string;
  vehicleNumber?: string;
  vehicleType?: VehicleType;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  khaltiPidx?: string;
  paidAt?: string | null;
  bookingStartTime?: string | null;
  bookingEndTime?: string | null;
  bookingSource: BookingSource;
};

export type AdminPaymentsPageResponse = {
  content: AdminPaymentListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AdminPaymentCustomer = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: CustomerRole | null;
  vehicleNumber?: string | null;
};

export type AdminPaymentBooking = {
  id?: string | null;
  status?: string | null;
  source?: BookingSource | null;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  vehicleType?: VehicleType | null;
  vehicleNumber?: string | null;
};

export type AdminPaymentParking = {
  id?: string | null;
  name?: string | null;
  slotId?: string | null;
  slotCode?: string | null;
  vendorId?: string | null;
  vendorName?: string | null;
};

export type AdminPaymentRefund = {
  eligible: boolean;
  amount?: number | null;
  status?: string | null;
  reason?: string | null;
};

export type AdminPaymentDetail = {
  paymentId: string;
  bookingId?: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  khaltiPidx?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  customer: AdminPaymentCustomer;
  booking: AdminPaymentBooking;
  parking: AdminPaymentParking;
  refund?: AdminPaymentRefund | null;
};

export type RefundStatus = "NONE" | "PENDING" | "COMPLETED" | "FAILED";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export type DriverPaymentQueryParams = {
  search?: string;
  status?: PaymentStatus;
  fromDate?: string;
  toDate?: string;
  page: number;
  size: number;
  sort?: string;
};

export type DriverPaymentBooking = {
  bookingId?: string | null;
  parkingLocationId?: string | null;
  parkingLocationName?: string | null;
  address?: string | null;
  slotId?: string | null;
  slotNumber?: string | null;
  vehicleNumber?: string | null;
  vehicleType?: VehicleType | null;
  startTime?: string | null;
  endTime?: string | null;
  durationMinutes?: number | null;
  ratePerHour?: number | null;
  totalAmount?: number | null;
  status?: BookingStatus | null;
};

export type DriverPaymentRefund = {
  refundEligible: boolean;
  refundStatus: RefundStatus;
  refundAmount?: number | null;
};

export type DriverPaymentHistoryItem = {
  paymentId: string;
  bookingId?: string | null;
  transactionId?: string | null;
  amount: number;
  status: PaymentStatus;
  paymentMethod: "KHALTI";
  paymentUrl?: string | null;
  pidx?: string | null;
  paidAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  message?: string | null;
  booking: DriverPaymentBooking;
  refund: DriverPaymentRefund;
};

export type DriverPaymentSummary = {
  totalSpent: number;
  totalPaymentCount: number;
  successfulPaymentCount: number;
  successfulAmount: number;
  pendingPaymentCount: number;
  pendingAmount: number;
  failedPaymentCount: number;
  failedAmount: number;
};

export type DriverPaymentPageResponse = {
  content: DriverPaymentHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  summary: DriverPaymentSummary;
};
