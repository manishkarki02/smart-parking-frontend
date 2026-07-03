import { Receipt } from "lucide-react";
import type { DataTableColumn } from "@/common";
import { Button } from "@/components/ui/button";
import { KhaltiBadge, PaymentStatusBadge } from "@/features/payments/components/driver/DriverPaymentHistorySections";
import type { DriverPaymentHistoryItem } from "@/features/payments/types/payment.types";
import {
  formatPaymentCurrency,
  truncatePaymentId,
} from "@/features/payments/utils/payment.utils";
import {
  formatDriverPaymentAmountMeta,
  formatDriverPaymentPaidAt,
} from "@/features/payments/utils/driver-payment-page.utils";

export function buildDriverPaymentColumns({
  onReceiptClick,
  onPayClick,
  isPaymentActionPending,
}: {
  onReceiptClick: (payment: DriverPaymentHistoryItem) => void;
  onPayClick: (payment: DriverPaymentHistoryItem) => void;
  isPaymentActionPending: boolean;
}): DataTableColumn<DriverPaymentHistoryItem>[] {
  return [
    {
      id: "paymentId",
      header: "Payment ID",
      className: "font-mono text-xs",
      cell: (payment) => (
        <span
          className="font-semibold text-blue-600"
          title={payment.paymentId}
        >
          {truncatePaymentId(payment.paymentId)}
        </span>
      ),
      compact: true,
    },
    {
      id: "transactionId",
      header: "Transaction ID",
      className: "font-mono text-xs",
      cell: (payment) => (
        <span title={payment.transactionId ?? undefined}>
          {truncatePaymentId(payment.transactionId)}
        </span>
      ),
    },
    {
      id: "parking",
      header: "Parking / Booking",
      cell: (payment) => (
        <div className="min-w-0">
          <p
            className="truncate font-medium"
            title={payment.booking.parkingLocationName ?? undefined}
          >
            {payment.booking.parkingLocationName ?? "Parking location"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {payment.booking.slotNumber ?? "No slot"} •{" "}
            {truncatePaymentId(payment.bookingId)}
          </p>
        </div>
      ),
    },
    {
      id: "method",
      header: "Method",
      cell: () => <KhaltiBadge />,
      compact: true,
    },
    {
      id: "amount",
      header: "Amount",
      align: "right",
      cell: (payment) => (
        <div className="min-w-0 text-right">
          <p className="font-semibold">
            {formatPaymentCurrency(payment.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatDriverPaymentAmountMeta(payment)}
          </p>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (payment) => <PaymentStatusBadge status={payment.status} />,
      compact: true,
    },
    {
      id: "paidAt",
      header: "Paid At",
      cell: (payment) => formatDriverPaymentPaidAt(payment),
    },
    {
      id: "action",
      header: "Receipt / Action",
      align: "right",
      cell: (payment) =>
        renderPaymentRowAction({
          payment,
          isPending: isPaymentActionPending,
          onReceiptClick,
          onPayClick,
        }),
    },
  ];
}

function renderPaymentRowAction({
  payment,
  isPending,
  onReceiptClick,
  onPayClick,
}: {
  payment: DriverPaymentHistoryItem;
  isPending: boolean;
  onReceiptClick: (payment: DriverPaymentHistoryItem) => void;
  onPayClick: (payment: DriverPaymentHistoryItem) => void;
}) {
  if (payment.status === "SUCCESS") {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onReceiptClick(payment)}
      >
        <Receipt className="size-4" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">View Receipt</span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={payment.status === "FAILED" ? "outline" : "default"}
      disabled={isPending}
      onClick={() => onPayClick(payment)}
    >
      {payment.status === "FAILED" ? "Retry" : "Pay Now"}
    </Button>
  );
}
