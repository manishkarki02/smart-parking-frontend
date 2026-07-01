import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ReceiptText,
} from "lucide-react";
import { InfoItem } from "@/common";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b bg-slate-50 px-6 py-7 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-9" />
          </div>
          <DialogTitle className="text-3xl font-black tracking-tight text-slate-950">
            Payment successful
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            Your parking payment was verified and your booking is ready.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 p-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-4">
            <div className="rounded-lg border border-dashed border-emerald-300 bg-emerald-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                    Smart Parking Ticket
                  </p>
                  <h1 className="mt-2 text-2xl font-black text-slate-950">
                    {booking?.parkingLocationName ?? "Parking booking"}
                  </h1>
                </div>
                <Badge
                  variant={isSuccessful ? "default" : "secondary"}
                  className="shrink-0"
                >
                  {status}
                </Badge>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <TicketLine
                  icon={<ReceiptText className="size-4" />}
                  label="Booking ID"
                  value={payment.bookingId ?? "-"}
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

            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
              <Button variant="outline" asChild>
                <Link to="/bookings">My bookings</Link>
              </Button>
            </div>
          </section>

          <section className="space-y-3">
            <InfoItem
              label="Amount paid"
              value={formatPaymentAmount(payment, booking)}
            />
            <InfoItem
              label="Payment method"
              value={payment.paymentMethod ?? booking?.paymentMethod ?? "-"}
            />
            <InfoItem label="Payment status" value={status} />
            <InfoItem
              label="Paid at"
              value={formatBookingDateTime(payment.paidAt ?? booking?.paidAt)}
            />
            <InfoItem
              label="Transaction ID"
              value={payment.transactionId ?? "-"}
            />
            <InfoItem label="Payment ID" value={payment.paymentId ?? "-"} />
            <InfoItem
              label="Vehicle"
              value={
                booking
                  ? `${booking.vehicleNumber ?? "-"} (${formatVehicleType(
                      booking.vehicleType,
                    )})`
                  : "-"
              }
            />
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
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-white/80 p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <div className="truncate text-sm font-bold text-slate-950">{value}</div>
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
