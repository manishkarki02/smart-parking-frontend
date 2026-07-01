import { Badge } from "@/components/ui/badge";
import type { DataTableColumn } from "@/common";
import type { AdminPaymentListItem } from "@/features/payments/types/payment.types";
import {
  formatBookingSource,
  formatPaymentCurrency,
  formatPaymentDateTime,
  formatPaymentMethod,
  formatPaymentStatus,
  formatVehicleType,
  getPaymentMethodBadgeVariant,
  getPaymentStatusBadgeVariant,
  truncatePaymentId,
} from "@/features/payments/utils/payment.utils";

export const adminPaymentTableColumns: DataTableColumn<AdminPaymentListItem>[] = [
  {
    id: "paymentId",
    header: "Payment ID",
    className: "font-mono text-xs",
    cell: (payment) => (
      <span title={payment.paymentId}>{truncatePaymentId(payment.paymentId)}</span>
    ),
    compact: true,
  },
  {
    id: "bookingId",
    header: "Booking ID",
    className: "font-mono text-xs",
    cell: (payment) => (
      <span title={payment.bookingId}>{truncatePaymentId(payment.bookingId)}</span>
    ),
    compact: true,
  },
  {
    id: "customer",
    header: "Customer",
    cell: (payment) => (
      <div className="min-w-40">
        <p className="truncate font-medium">{payment.customerName}</p>
        <p className="truncate text-xs text-muted-foreground">
          {payment.customerPhone ?? "No phone"}
        </p>
      </div>
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: (payment) => (
      <div className="min-w-44">
        <p className="truncate font-medium" title={payment.parkingLocationName}>
          {payment.parkingLocationName ?? "-"}
        </p>
        <p className="text-xs text-muted-foreground">
          {payment.slotCode ?? "-"} • {formatBookingSource(payment.bookingSource)}
        </p>
      </div>
    ),
  },
  {
    id: "vehicle",
    header: "Vehicle",
    cell: (payment) => (
      <div className="min-w-36">
        <p className="truncate font-medium">
          {payment.vehicleNumber ?? "No vehicle"}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatVehicleType(payment.vehicleType)}
        </p>
      </div>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    align: "right",
    cell: (payment) => formatPaymentCurrency(payment.amount),
  },
  {
    id: "method",
    header: "Method",
    cell: (payment) => (
      <Badge variant={getPaymentMethodBadgeVariant(payment.method)}>
        {formatPaymentMethod(payment.method)}
      </Badge>
    ),
    compact: true,
  },
  {
    id: "status",
    header: "Status",
    cell: (payment) => (
      <Badge variant={getPaymentStatusBadgeVariant(payment.status)}>
        {formatPaymentStatus(payment.status)}
      </Badge>
    ),
    compact: true,
  },
  {
    id: "paidAt",
    header: "Paid At",
    cell: (payment) => formatPaymentDateTime(payment.paidAt),
  },
];

export const adminPaymentCompactTableColumns: DataTableColumn<AdminPaymentListItem>[] = [
  adminPaymentTableColumns[0],
  adminPaymentTableColumns[2],
  adminPaymentTableColumns[5],
  adminPaymentTableColumns[7],
];
