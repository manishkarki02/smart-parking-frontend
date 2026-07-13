export type KnownPaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export type PaymentStatus = KnownPaymentStatus | string;

export type PaymentMethod = "CASH" | "KHALTI" | "ESEWA" | string;
