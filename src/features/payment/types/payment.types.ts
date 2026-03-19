export interface PaymentRequest {
  bookingId: number;
  paymentMethod: "KHALTI" | "CASH";
}

export interface PaymentResponse {
  paymentId: number;
  bookingId: number;
  amount: number;
  status: string;
  transactionId: string;
  PaymentUrl: string;
  paidAt: string;
  message: string;
  pidx: string;
}
