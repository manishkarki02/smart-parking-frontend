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
