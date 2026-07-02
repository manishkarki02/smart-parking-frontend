import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
  Bike,
  Car,
  CheckCircle2,
  Eye,
  Loader2,
  Wrench,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  walkInBookingSchema,
  type WalkInBookingFormValues,
} from "@/features/bookings/schemas/walk-in-booking.schema";
import type { VendorBookingAction } from "@/features/bookings/types/booking.types";
import type {
  ParkingLocation,
  ParkingSlot,
  ParkingSlotVehicleType,
} from "@/features/parkings/types/parking.types";
import { useUpdateSlotStatusMutation } from "@/features/parkings/hooks/use-update-slot-status-mutation";
import { cn } from "@/lib/utils";
import { useCreateWalkInBooking } from "../hooks/use-create-walk-in-booking";
import { useVendorBookingStatusMutation } from "../hooks/use-vendor-booking-status-mutation";

interface VendorSlotActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slot: ParkingSlot | null;
  parkingLocation: ParkingLocation;
}

const statusLabels: Record<ParkingSlot["status"], string> = {
  AVAILABLE: "Available",
  RESERVED: "Reserved",
  BOOKED: "Booked",
  OCCUPIED: "Occupied",
  MAINTENANCE: "Maintenance",
};

const statusHelpers: Record<ParkingSlot["status"], string> = {
  AVAILABLE: "Ready for a new booking",
  RESERVED: "Pending booking confirmation",
  BOOKED: "Upcoming vehicle booking",
  OCCUPIED: "Active vehicle parked",
  MAINTENANCE: "Slot is under repair",
};

const statusBadgeClasses: Record<ParkingSlot["status"], string> = {
  AVAILABLE: "border-green-200 bg-green-50 text-green-700",
  RESERVED: "border-amber-200 bg-amber-50 text-amber-700",
  BOOKED: "border-blue-200 bg-blue-50 text-blue-700",
  OCCUPIED: "border-red-200 bg-red-50 text-red-700",
  MAINTENANCE: "border-slate-200 bg-slate-100 text-slate-700",
};

const vehicleLabels: Record<ParkingSlotVehicleType, string> = {
  TWO_WHEELER: "Two Wheeler",
  FOUR_WHEELER: "Four Wheeler",
};

function toDateTimeLocalValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function getDefaultEndTime(): string {
  const end = new Date();
  end.setHours(end.getHours() + 1);
  return toDateTimeLocalValue(end);
}

function formatDateTime(value?: string): string {
  if (!value) return "Not available";

  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMoney(value?: number) {
  if (value == null) return "Rs 0";

  return `Rs ${Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function formatPaymentStatus(status?: string) {
  if (status === "SUCCESS") return "Paid";
  if (status === "FAILED") return "Failed";
  if (status === "PENDING") return "Pending";
  return "Payment unknown";
}

export function VendorSlotActionDialog({
  open,
  onOpenChange,
  slot,
  parkingLocation,
}: VendorSlotActionDialogProps) {
  const navigate = useNavigate();
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const parkingLocationId = parkingLocation.id;
  const slotStatusMutation = useUpdateSlotStatusMutation(parkingLocationId);
  const walkInMutation = useCreateWalkInBooking(parkingLocationId);
  const bookingStatusMutation = useVendorBookingStatusMutation(parkingLocationId);

  const form = useForm<WalkInBookingFormValues>({
    resolver: zodResolver(walkInBookingSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      vehicleNumber: "",
      startTime: toDateTimeLocalValue(new Date()),
      endTime: getDefaultEndTime(),
      paymentMethod: "CASH",
    },
  });

  const paymentMethod = useWatch<WalkInBookingFormValues, "paymentMethod">({
    control: form.control,
    name: "paymentMethod",
  });

  useEffect(() => {
    if (open) {
      form.reset({
        customerName: "",
        customerPhone: "",
        vehicleNumber: "",
        startTime: toDateTimeLocalValue(new Date()),
        endTime: getDefaultEndTime(),
        paymentMethod: "CASH",
      });
    }
  }, [form, open, slot?.id]);

  const activeBooking = slot?.activeBooking;
  const isPending =
    slotStatusMutation.isPending ||
    walkInMutation.isPending ||
    bookingStatusMutation.isPending;

  const hourlyRate = useMemo(() => {
    if (!slot) return undefined;

    return slot.vehicleType === "FOUR_WHEELER"
      ? parkingLocation.fourWheelerRatePerHour
      : parkingLocation.twoWheelerRatePerHour;
  }, [
    parkingLocation.fourWheelerRatePerHour,
    parkingLocation.twoWheelerRatePerHour,
    slot,
  ]);

  if (!slot) return null;

  const closeAfterSuccess = () => {
    setShowWalkInForm(false);
    onOpenChange(false);
  };

  const updateSlotStatus = async (status: "AVAILABLE" | "MAINTENANCE") => {
    await slotStatusMutation.mutateAsync({
      parkingLocationId,
      slotId: slot.id,
      status,
    });
    toast.success(
      status === "MAINTENANCE"
        ? "Slot marked as maintenance"
        : "Slot marked as available",
    );
    closeAfterSuccess();
  };

  const updateBookingStatus = async (action: VendorBookingAction) => {
    if (!activeBooking?.bookingId) {
      toast.error("Active booking not found for this slot.");
      return;
    }

    await bookingStatusMutation.mutateAsync({
      bookingId: activeBooking.bookingId,
      data: { action },
    });
    toast.success(action === "CHECK_IN" ? "Booking checked in" : "Booking completed");
    closeAfterSuccess();
  };

  const createWalkInBooking = async (values: WalkInBookingFormValues) => {
    await walkInMutation.mutateAsync({
      parkingLocationId,
      slotId: slot.id,
      vehicleType: slot.vehicleType,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      vehicleNumber: values.vehicleNumber,
      startTime: values.startTime,
      endTime: values.endTime,
      paymentMethod: values.paymentMethod,
    });
    closeAfterSuccess();
  };

  const viewBooking = () => {
    onOpenChange(false);
    void navigate({ to: "/vendor/bookings" });
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowWalkInForm(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle className="text-base font-semibold text-slate-950">
            Slot Details
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {parkingLocation.name} · {vehicleLabels[slot.vehicleType]}
            {hourlyRate ? ` · Rs ${hourlyRate}/hr` : ""}
          </DialogDescription>
        </DialogHeader>

        {showWalkInForm ? (
          <form
            className="max-h-[calc(90vh-76px)] space-y-4 overflow-y-auto p-5"
            onSubmit={form.handleSubmit(createWalkInBooking)}
          >
            <div className="rounded-lg border bg-slate-50 p-3 text-sm">
              <p className="font-semibold text-slate-950">
                Create Walk-in Booking
              </p>
              <p className="text-slate-500">
                Slot: {slot.slotNumber} · {vehicleLabels[slot.vehicleType]}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldError
                label="Customer Name"
                error={form.formState.errors.customerName?.message}
              >
                <Input {...form.register("customerName")} disabled={isPending} />
              </FieldError>

              <FieldError
                label="Customer Phone"
                error={form.formState.errors.customerPhone?.message}
              >
                <Input {...form.register("customerPhone")} disabled={isPending} />
              </FieldError>
            </div>

            <FieldError
              label="Vehicle Number"
              error={form.formState.errors.vehicleNumber?.message}
            >
              <Input {...form.register("vehicleNumber")} disabled={isPending} />
            </FieldError>

            <div className="grid gap-4 sm:grid-cols-2">
              <FieldError
                label="Start Time"
                error={form.formState.errors.startTime?.message}
              >
                <Input
                  type="datetime-local"
                  {...form.register("startTime")}
                  disabled={isPending}
                />
              </FieldError>

              <FieldError
                label="Expected End Time"
                error={form.formState.errors.endTime?.message}
              >
                <Input
                  type="datetime-local"
                  {...form.register("endTime")}
                  disabled={isPending}
                />
              </FieldError>
            </div>

            <FieldError
              label="Payment Method"
              error={form.formState.errors.paymentMethod?.message}
            >
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  form.setValue(
                    "paymentMethod",
                    value as WalkInBookingFormValues["paymentMethod"],
                    { shouldValidate: true },
                  )
                }
                disabled={isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="KHALTI">Khalti</SelectItem>
                  <SelectItem value="ESEWA">Esewa</SelectItem>
                </SelectContent>
              </Select>
            </FieldError>

            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWalkInForm(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {walkInMutation.isPending && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Create Booking
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="max-h-[calc(90vh-76px)] overflow-y-auto">
            <div className="space-y-4 p-5">
              <SlotSummaryPanel slot={slot} />

              {(slot.status === "RESERVED" ||
                slot.status === "BOOKED" ||
                slot.status === "OCCUPIED") && <BookingSummary slot={slot} />}

              {slot.status === "AVAILABLE" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => setShowWalkInForm(true)}
                    disabled={isPending}
                  >
                    Create Booking
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => updateSlotStatus("MAINTENANCE")}
                    disabled={isPending}
                  >
                    {slotStatusMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Wrench className="size-4" />
                    )}
                    Mark Maintenance
                  </Button>
                </div>
              )}

              {slot.status === "MAINTENANCE" && (
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => updateSlotStatus("AVAILABLE")}
                  disabled={isPending}
                >
                  {slotStatusMutation.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Mark Available
                </Button>
              )}
            </div>

            <DialogFooter className="gap-2 border-t bg-white px-5 py-4 sm:gap-2">
              {(slot.status === "RESERVED" ||
                slot.status === "BOOKED" ||
                slot.status === "OCCUPIED") && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={viewBooking}
                  disabled={isPending}
                >
                  <Eye className="size-4" />
                  View Booking
                </Button>
              )}

              {slot.status === "BOOKED" && (
                <Button
                  type="button"
                  onClick={() => updateBookingStatus("CHECK_IN")}
                  disabled={isPending || !activeBooking?.bookingId}
                >
                  {bookingStatusMutation.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Check In
                </Button>
              )}

              {slot.status === "OCCUPIED" && (
                <Button
                  type="button"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => updateBookingStatus("COMPLETE")}
                  disabled={isPending || !activeBooking?.bookingId}
                >
                  {bookingStatusMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  Mark Complete
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SlotSummaryPanel({ slot }: { slot: ParkingSlot }) {
  const VehicleIcon = slot.vehicleType === "TWO_WHEELER" ? Bike : Car;

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-100 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <p className="text-xl font-bold text-slate-950">{slot.slotNumber}</p>
          <Badge
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold shadow-none",
              statusBadgeClasses[slot.status],
            )}
          >
            {statusLabels[slot.status]}
          </Badge>
        </div>
        <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          {slot.vehicleType.replace("_", " ")}
        </p>
      </div>
      <div className="text-right">
        <VehicleIcon className="ml-auto size-4 text-slate-500" />
        <p className="mt-2 text-xs text-slate-500">{statusHelpers[slot.status]}</p>
      </div>
    </div>
  );
}

function FieldError({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function BookingSummary({ slot }: { slot: ParkingSlot }) {
  const booking = slot.activeBooking;

  if (!booking) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
        No active booking details available.
      </div>
    );
  }

  const customer = booking.customerName ?? booking.driverName ?? "Not available";
  const initials = customer
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Active Booking
        </p>
        <SummaryRow label="Booking ID" value={`#${booking.bookingId.slice(0, 8)}`} />
        <SummaryRow label="Start Time" value={formatDateTime(booking.startTime)} />
        <SummaryRow label="Expected End" value={formatDateTime(booking.endTime)} />
        <SummaryRow
          label="Payment"
          value={`${formatPaymentStatus(booking.paymentStatus)} · ${formatMoney(
            booking.totalAmount,
          )}`}
          valueClassName={
            booking.paymentStatus === "SUCCESS" ? "text-green-700" : undefined
          }
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Customer
        </p>
        <div className="flex items-center gap-3 rounded-lg bg-slate-100 p-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-700">
            {initials || "C"}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-950">{customer}</p>
            <p className="truncate text-xs text-slate-500">
              {booking.customerPhone ?? "No phone"} ·{" "}
              {booking.vehicleNumber ?? "No vehicle number"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 text-sm last:border-b-0">
      <span className="text-slate-500">{label}</span>
      <span className={cn("text-right font-semibold text-slate-950", valueClassName)}>
        {value}
      </span>
    </div>
  );
}
