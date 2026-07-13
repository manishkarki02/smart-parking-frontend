import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BookingResponse } from "@/features/bookings/types/booking.types";
import {
  formatBookingAmount,
  formatBookingDate,
  formatBookingDateTime,
  formatBookingTime,
  formatVehicleType,
} from "@/features/bookings/utils/booking-formatters";
import { cn } from "@/lib/utils";

export interface PaymentSuccessDetails {
  paymentSuccess?: boolean;
  bookingId?: string;
  paymentId?: string;
  status?: string;
  paymentMethod?: string;
  amount?: number;
  transactionId?: string;
  paidAt?: string;
  pidx?: string;
  message?: string;
}

interface PaymentSuccessTicketDialogProps {
  open: boolean;
  payment: PaymentSuccessDetails;
  booking?: BookingResponse;
  onOpenChange: (open: boolean) => void;
}

export function PaymentSuccessTicketDialog({
  open,
  payment,
  booking,
  onOpenChange,
}: PaymentSuccessTicketDialogProps) {
  const status = booking?.paymentStatus ?? payment.status ?? "SUCCESS";
  const isSuccessful = status.toUpperCase() === "SUCCESS";
  const paymentMethod = payment.paymentMethod ?? booking?.paymentMethod ?? "-";
  const paidAt = formatBookingDateTime(payment.paidAt ?? booking?.paidAt);
  const transactionId = payment.transactionId ?? "-";
  const paymentId = payment.paymentId ?? "-";
  const vehicle = booking
    ? `${booking.vehicleNumber ?? "-"} (${formatVehicleType(booking.vehicleType)})`
    : "-";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-4xl">
        <div className="border-b bg-white px-5 py-5 sm:px-6">
          <DialogHeader className="text-left">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex size-12 shrink-0 items-center justify-center rounded-full",
                  isSuccessful
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700",
                )}
              >
                <CheckCircle2 className="size-7" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">
                  {isSuccessful ? "Payment successful" : "Payment receipt"}
                </DialogTitle>
                <DialogDescription className="mt-1 text-sm text-slate-600">
                  {isSuccessful
                    ? "Your parking payment was verified and your booking is ready."
                    : "Your parking payment details are shown below."}
                </DialogDescription>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "mt-1 shrink-0",
                  isSuccessful
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                )}
              >
                {isSuccessful ? "Paid" : status}
              </Badge>
            </div>
          </DialogHeader>
        </div>

        <div className="grid gap-5 bg-slate-50 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)]">
          <section className="min-w-0 space-y-4">
            <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-sm">
              <div className="border-b border-dashed border-emerald-200 bg-emerald-50 px-5 py-4">
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      Smart Parking Ticket
                    </p>
                    <h3 className="mt-1 truncate text-xl font-semibold text-slate-950">
                      {booking?.parkingLocationName ?? "Parking booking"}
                    </h3>
                  </div>
                  <ShieldCheck className="size-5 shrink-0 text-emerald-700" aria-hidden="true" />
                </div>
              </div>

              <div className="grid gap-3 p-4 sm:grid-cols-2">
                <TicketLine
                  icon={<ReceiptText className="size-4" />}
                  label="Booking ID"
                  value={shorten(payment.bookingId)}
                  title={payment.bookingId}
                />
                <TicketLine
                  icon={<MapPin className="size-4" />}
                  label="Slot"
                  value={booking?.slotNumber ?? "-"}
                />
                <TicketLine
                  icon={<CalendarCheck className="size-4" />}
                  label="Date"
                  value={booking ? formatBookingDate(booking.startTime) : "-"}
                />
                <TicketLine
                  icon={<Clock className="size-4" />}
                  label="Time"
                  value={formatTicketTime(booking)}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="sm:min-w-32"
                onClick={() => onOpenChange(false)}
              >
                Done
              </Button>
              <Button className="sm:min-w-36" asChild>
                <Link to="/bookings">My bookings</Link>
              </Button>
            </div>
          </section>

          <section className="min-w-0 rounded-lg border bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 border-b p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount paid
                </p>
                <p className="mt-1 text-2xl font-semibold text-slate-950">
                  {formatPaymentAmount(payment, booking)}
                </p>
              </div>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <CreditCard className="size-5" aria-hidden="true" />
              </div>
            </div>

            <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-1">
              <ReceiptField label="Payment method" value={paymentMethod} />
              <ReceiptField label="Payment status" value={isSuccessful ? "Paid" : status} />
              <ReceiptField label="Paid at" value={paidAt} />
              <ReceiptField label="Transaction ID" value={shorten(transactionId)} title={transactionId} />
              <ReceiptField label="Payment ID" value={shorten(paymentId)} title={paymentId} />
              <ReceiptField label="Vehicle" value={vehicle} />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TicketLine({
  icon,
  label,
  value,
  title,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  title?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-md border bg-white p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <div className="truncate text-sm font-semibold text-slate-950" title={title}>
          {value}
        </div>
      </div>
    </div>
  );
}

function ReceiptField({
  label,
  value,
  title,
}: {
  label: string;
  value: ReactNode;
  title?: string;
}) {
  return (
    <div className="min-w-0 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div
        className="mt-1 truncate text-sm font-semibold text-slate-950"
        title={title}
      >
        {value}
      </div>
    </div>
  );
}

function formatTicketTime(booking?: BookingResponse): string {
  if (!booking) return "-";
  return `${formatBookingTime(booking.startTime)}-${formatBookingTime(
    booking.endTime,
  )}`;
}

function formatPaymentAmount(
  payment: PaymentSuccessDetails,
  booking?: BookingResponse,
): string {
  if (typeof payment.amount === "number") {
    return formatBookingAmount(payment.amount);
  }
  return formatBookingAmount(booking?.totalAmount);
}

function shorten(value?: string | null): string {
  if (!value || value === "-") {
    return "-";
  }

  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}
