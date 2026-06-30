import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { queryKeys } from "@/config/query-keys";
import { onSiteBookingSchema, type OnSiteBookingFormValues } from "@/features/bookings/schemas/on-site-booking.schema";
import { getVendorBookings, type VendorBooking } from "@/features/bookings/services/booking.service";
import type { VendorBookingAction } from "@/features/bookings/types/booking.types";
import { getVendorSlots } from "@/features/parkings/services/parking.service";
import type { ParkingSlotVehicleType } from "@/features/parkings/types/parking.types";
import {
  createWalkInBooking,
  getMyParkingLocations,
  updateVendorBookingStatus,
} from "@/features/vendor/services/vendor.service";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/vendor/bookings")({
  component: VendorBookingsPage,
});

type StatusFilter =
  | "ALL"
  | "RESERVED"
  | "BOOKED"
  | "CHECKED_IN"
  | "COMPLETED"
  | "CANCELLED"
  | "PAYMENT_PENDING";

type StatusView = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
};

const PAGE_SIZE = 8;

function toDateTimeInputValue(date: Date): string {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
}

function formatTime(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  return `${formatDate(value)} ${formatTime(value)}`;
}

function formatAmount(booking: VendorBooking): string {
  return `Rs. ${Number(booking.totalAmount ?? booking.amount ?? 0).toFixed(2)}`;
}

function formatVehicleType(vehicleType?: string): string {
  if (vehicleType === "TWO_WHEELER") return "Two wheeler";
  if (vehicleType === "FOUR_WHEELER") return "Four wheeler";
  return "-";
}

function getBookingId(booking: VendorBooking): string {
  return booking.bookingId ?? booking.id;
}

function getSlot(booking: VendorBooking): string {
  return String(booking.slotNumber ?? booking.slot ?? "-");
}

function getCustomerName(booking: VendorBooking): string {
  return (
    booking.customerName ??
    booking.driverName ??
    booking.driver?.name ??
    booking.user?.name ??
    (booking.walkIn ? "On-site customer" : "Driver booking")
  );
}

function getCustomerPhone(booking: VendorBooking): string {
  return booking.customerPhone ?? booking.driverPhone ?? "-";
}

function getSourceLabel(booking: VendorBooking): string {
  return booking.walkIn ? "On-site" : "App Driver";
}

function getOperationalStatus(booking: VendorBooking): StatusView {
  const status = booking.status?.toUpperCase();
  const slotStatus = booking.slotStatus;
  const paymentStatus = booking.paymentStatus?.toUpperCase();

  if (status === "COMPLETED") {
    return { label: "Completed", variant: "default" };
  }
  if (status === "CANCELLED") {
    return { label: "Cancelled", variant: "destructive" };
  }
  if (status === "PENDING" || slotStatus === "RESERVED") {
    return {
      label: paymentStatus === "PENDING" ? "Payment pending" : "Reserved",
      variant: "outline",
    };
  }
  if (status === "CONFIRMED" && slotStatus === "BOOKED") {
    return { label: "Booked", variant: "secondary" };
  }
  if (status === "CONFIRMED" && slotStatus === "OCCUPIED") {
    return {
      label: booking.walkIn ? "On-site active" : "Checked in",
      variant: "secondary",
    };
  }

  return { label: status || "Unknown", variant: "outline" };
}

function getPaymentStatusVariant(
  status?: string | null,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "default";
    case "FAILED":
      return "destructive";
    case "PENDING":
      return "secondary";
    default:
      return "outline";
  }
}

function matchesStatusFilter(booking: VendorBooking, filter: StatusFilter): boolean {
  if (filter === "ALL") return true;
  const status = booking.status?.toUpperCase();
  const slotStatus = booking.slotStatus;
  const paymentStatus = booking.paymentStatus?.toUpperCase();

  switch (filter) {
    case "RESERVED":
      return status === "PENDING" || slotStatus === "RESERVED";
    case "BOOKED":
      return status === "CONFIRMED" && slotStatus === "BOOKED";
    case "CHECKED_IN":
      return status === "CONFIRMED" && slotStatus === "OCCUPIED";
    case "COMPLETED":
      return status === "COMPLETED";
    case "CANCELLED":
      return status === "CANCELLED";
    case "PAYMENT_PENDING":
      return paymentStatus === "PENDING" || status === "PENDING";
    default:
      return true;
  }
}

function canCheckIn(booking: VendorBooking): boolean {
  return booking.status === "CONFIRMED" && booking.slotStatus === "BOOKED";
}

function canComplete(booking: VendorBooking): boolean {
  return booking.status === "CONFIRMED" && booking.slotStatus === "OCCUPIED";
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-3 text-3xl font-bold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ booking }: { booking: VendorBooking }) {
  const status = getOperationalStatus(booking);
  return <Badge variant={status.variant}>{status.label}</Badge>;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function BookingDetailPanel({
  booking,
  isMutating,
  onClose,
  onAction,
}: {
  booking: VendorBooking;
  isMutating: boolean;
  onClose: () => void;
  onAction: (booking: VendorBooking, action: VendorBookingAction) => void;
}) {
  const status = getOperationalStatus(booking);

  return (
    <aside className="flex h-full min-h-[680px] flex-col bg-background">
      <div className="flex items-start justify-between border-b p-5">
        <div>
          <h3 className="text-xl font-semibold">{getCustomerName(booking)}</h3>
          <p className="font-mono text-sm text-muted-foreground">
            {getBookingId(booking).slice(0, 8)}
          </p>
        </div>
        <Button type="button" variant="outline" size="icon" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Booking info
        </p>
        <DetailRow
          label="Status"
          value={status.label}
        />
        <DetailRow label="Location" value={booking.parkingLocationName ?? "-"} />
        <DetailRow label="Slot" value={getSlot(booking)} />
        <DetailRow label="Vehicle type" value={formatVehicleType(booking.vehicleType)} />
        <DetailRow label="Vehicle number" value={booking.vehicleNumber ?? "-"} />
        <DetailRow label="Check-in / start" value={formatDateTime(booking.startTime)} />
        <DetailRow label="Check-out / end" value={formatDateTime(booking.endTime)} />
        <DetailRow label="Amount" value={formatAmount(booking)} />
        <DetailRow label="Payment method" value={booking.paymentMethod ?? "-"} />
        <DetailRow label="Payment status" value={booking.paymentStatus ?? "-"} />
        <DetailRow label="Paid at" value={formatDateTime(booking.paidAt)} />
        <DetailRow label="Source" value={getSourceLabel(booking)} />

        <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Customer
        </p>
        <DetailRow label="Name" value={getCustomerName(booking)} />
        <DetailRow label="Phone" value={getCustomerPhone(booking)} />
        <DetailRow label="Driver email" value={booking.driverEmail ?? booking.driver?.email ?? booking.user?.email ?? "-"} />

        <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Timeline
        </p>
        <div className="space-y-4">
          <TimelineItem label="Reserved / created" value={formatDateTime(booking.createdAt ?? booking.startTime)} />
          {booking.paidAt && <TimelineItem label="Paid" value={formatDateTime(booking.paidAt)} />}
          {booking.slotStatus === "OCCUPIED" && (
            <TimelineItem label="Checked in" value={formatDateTime(booking.startTime)} />
          )}
          {booking.status === "COMPLETED" && (
            <TimelineItem label="Completed" value={formatDateTime(booking.endTime)} />
          )}
          {booking.cancelledAt && (
            <TimelineItem label="Cancelled" value={formatDateTime(booking.cancelledAt)} />
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t p-5">
        {canCheckIn(booking) && (
          <Button
            type="button"
            className="flex-1"
            disabled={isMutating}
            onClick={() => onAction(booking, "CHECK_IN")}
          >
            Check in
          </Button>
        )}
        {canComplete(booking) && (
          <Button
            type="button"
            className="flex-1"
            disabled={isMutating}
            onClick={() => onAction(booking, "COMPLETE")}
          >
            Mark complete
          </Button>
        )}
        {!canCheckIn(booking) && !canComplete(booking) && (
          <Button type="button" className="flex-1" variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>
    </aside>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative pl-6">
      <span className="absolute left-0 top-1.5 size-2.5 rounded-full bg-primary" />
      <p className="font-medium">{label}</p>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function AddOnSiteBookingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const start = useMemo(() => new Date(), []);
  const defaultStartTime = toDateTimeInputValue(start);
  const defaultEndTime = toDateTimeInputValue(new Date(start.getTime() + 60 * 60_000));

  const form = useForm<OnSiteBookingFormValues>({
    resolver: zodResolver(onSiteBookingSchema),
    defaultValues: {
      parkingLocationId: "",
      vehicleType: "TWO_WHEELER",
      slotId: "",
      customerName: "",
      customerPhone: "",
      vehicleNumber: "",
      startTime: defaultStartTime,
      endTime: defaultEndTime,
      paymentMethod: "CASH",
    },
  });

  const parkingLocationId = form.watch("parkingLocationId");
  const vehicleType = form.watch("vehicleType");

  const { data: locations = [], isLoading: locationsLoading } = useCustomQuery({
    key: queryKeys.parking.mine(),
    queryFn: getMyParkingLocations,
    options: { enabled: open },
  });

  const { data: slots = [], isLoading: slotsLoading } = useCustomQuery({
    key: parkingLocationId
      ? queryKeys.parking.vendorSlots(parkingLocationId)
      : queryKeys.parking.vendorSlots("none"),
    queryFn: () => getVendorSlots(parkingLocationId),
    options: { enabled: open && Boolean(parkingLocationId) },
  });

  const availableSlots = slots.filter(
    (slot) => slot.status === "AVAILABLE" && slot.vehicleType === vehicleType,
  );

  const createMutation = useCustomMutation({
    api: createWalkInBooking,
    onSuccess: (booking) => {
      toast.success("On-site booking created");
      onOpenChange(false);
      form.reset({
        parkingLocationId: "",
        vehicleType: "TWO_WHEELER",
        slotId: "",
        customerName: "",
        customerPhone: "",
        vehicleNumber: "",
        startTime: toDateTimeInputValue(new Date()),
        endTime: toDateTimeInputValue(new Date(Date.now() + 60 * 60_000)),
        paymentMethod: "CASH",
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.vendor() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.parking.mine() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.vendorSlots(booking.parkingLocationId),
      });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      if (Array.isArray(message)) {
        message.forEach((item) => toast.error(item));
        return;
      }
      toast.error(message || "On-site booking failed");
      if (parkingLocationId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.parking.vendorSlots(parkingLocationId),
        });
      }
    },
  });

  function submit(values: OnSiteBookingFormValues) {
    createMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add on-site booking</DialogTitle>
          <DialogDescription>
            Create a booking for a customer who arrived directly at the parking location.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="parkingLocationId">Parking location</Label>
              <Select
                value={form.watch("parkingLocationId")}
                onValueChange={(value) => {
                  form.setValue("parkingLocationId", value, { shouldValidate: true });
                  form.setValue("slotId", "");
                }}
              >
                <SelectTrigger id="parkingLocationId" className="w-full">
                  <SelectValue placeholder={locationsLoading ? "Loading..." : "Select location"} />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.parkingLocationId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.parkingLocationId.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vehicleType">Vehicle type</Label>
              <Select
                value={form.watch("vehicleType")}
                onValueChange={(value) => {
                  form.setValue("vehicleType", value as ParkingSlotVehicleType, {
                    shouldValidate: true,
                  });
                  form.setValue("slotId", "");
                }}
              >
                <SelectTrigger id="vehicleType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TWO_WHEELER">Two wheeler</SelectItem>
                  <SelectItem value="FOUR_WHEELER">Four wheeler</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.vehicleType && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.vehicleType.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slotId">Available slot</Label>
            <Select
              value={form.watch("slotId")}
              onValueChange={(value) =>
                form.setValue("slotId", value, { shouldValidate: true })
              }
              disabled={!parkingLocationId || slotsLoading || availableSlots.length === 0}
            >
              <SelectTrigger id="slotId" className="w-full">
                <SelectValue
                  placeholder={
                    !parkingLocationId
                      ? "Select a location first"
                      : slotsLoading
                        ? "Loading slots..."
                        : availableSlots.length === 0
                          ? "No free slots"
                          : "Select a free slot"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id}>
                    {slot.slotNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.slotId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.slotId.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input
                id="customerName"
                placeholder="Customer name"
                {...form.register("customerName")}
              />
              {form.formState.errors.customerName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerPhone">Customer phone</Label>
              <Input
                id="customerPhone"
                placeholder="98XXXXXXXX"
                {...form.register("customerPhone")}
              />
              {form.formState.errors.customerPhone && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.customerPhone.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vehicleNumber">Vehicle number</Label>
              <Input
                id="vehicleNumber"
                placeholder="BA 2 PA 1234"
                {...form.register("vehicleNumber")}
              />
              {form.formState.errors.vehicleNumber && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.vehicleNumber.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentMethod">Payment method</Label>
              <Select
                value={form.watch("paymentMethod")}
                onValueChange={(value) =>
                  form.setValue(
                    "paymentMethod",
                    value as OnSiteBookingFormValues["paymentMethod"],
                    { shouldValidate: true },
                  )
                }
              >
                <SelectTrigger id="paymentMethod" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="KHALTI">Khalti</SelectItem>
                  <SelectItem value="ESEWA">Esewa</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.paymentMethod && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.paymentMethod.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startTime">Start time</Label>
              <Input id="startTime" type="datetime-local" {...form.register("startTime")} />
              {form.formState.errors.startTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.startTime.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">Expected end time</Label>
              <Input id="endTime" type="datetime-local" {...form.register("endTime")} />
              {form.formState.errors.endTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.endTime.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Create booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VendorBookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });
  const queryClient = useQueryClient();
  const [locationId, setLocationId] = useState("ALL");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const vendorLocationId = locationId === "ALL" ? undefined : locationId;

  const { data: locations = [] } = useCustomQuery({
    key: queryKeys.parking.mine(),
    queryFn: getMyParkingLocations,
    options: { enabled: isAuthorized },
  });

  const { data, isLoading, isError } = useCustomQuery({
    key: queryKeys.bookings.vendor({
      search,
      page,
      locationId: vendorLocationId,
      status: statusFilter,
    }),
    queryFn: () => getVendorBookings({ locationId: vendorLocationId }),
    options: { enabled: isAuthorized },
  });

  const bookings = useMemo(() => data?.data ?? [], [data?.data]);

  const filteredBookings = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return bookings.filter((booking) => {
      const haystack = [
        getBookingId(booking),
        getCustomerName(booking),
        getCustomerPhone(booking),
        booking.parkingLocationName,
        getSlot(booking),
        booking.vehicleNumber ?? "",
        booking.paymentMethod ?? "",
        booking.paymentStatus ?? "",
        getSourceLabel(booking),
        getOperationalStatus(booking).label,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || haystack.includes(normalizedSearch)) &&
        matchesStatusFilter(booking, statusFilter)
      );
    });
  }, [bookings, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / PAGE_SIZE));
  const pagedBookings = filteredBookings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedBooking =
    filteredBookings.find((booking) => getBookingId(booking) === selectedBookingId) ?? null;

  const summary = useMemo(() => {
    const today = new Date().toDateString();
    const completedToday = filteredBookings.filter(
      (booking) =>
        booking.status === "COMPLETED" &&
        booking.endTime &&
        new Date(booking.endTime).toDateString() === today,
    ).length;
    const completedTotal = filteredBookings.filter(
      (booking) => booking.status === "COMPLETED",
    ).length;
    const revenue = filteredBookings
      .filter(
        (booking) =>
          booking.paymentStatus === "SUCCESS" || booking.status === "COMPLETED",
      )
      .reduce((total, booking) => total + Number(booking.totalAmount ?? booking.amount ?? 0), 0);

    return {
      total: filteredBookings.length,
      active: filteredBookings.filter(
        (booking) =>
          booking.slotStatus === "RESERVED" ||
          booking.slotStatus === "BOOKED" ||
          booking.slotStatus === "OCCUPIED",
      ).length,
      completed: completedToday || completedTotal,
      revenue,
      completedHelper: completedToday ? "Today" : "Current filter",
    };
  }, [filteredBookings]);

  const statusMutation = useCustomMutation({
    api: updateVendorBookingStatus,
    onSuccess: (updatedBooking) => {
      toast.success("Booking updated");
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.vendor() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.vendor.dashboard() });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.vendorSlots(updatedBooking.parkingLocationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.parking.detail(updatedBooking.parkingLocationId),
      });
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      if (Array.isArray(message)) {
        message.forEach((item) => toast.error(item));
        return;
      }
      toast.error(message || "Booking update failed");
      if (selectedBooking?.parkingLocationId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.parking.vendorSlots(selectedBooking.parkingLocationId),
        });
      }
    },
  });

  function runAction(booking: VendorBooking, action: VendorBookingAction) {
    statusMutation.mutate({
      bookingId: getBookingId(booking),
      data: { action },
    });
  }

  function selectBooking(booking: VendorBooking) {
    setSelectedBookingId(getBookingId(booking));
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setIsDetailSheetOpen(true);
    }
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-full bg-muted/20">
      <div className="flex flex-col gap-4 border-b bg-background px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-semibold">Bookings</h1>
          <div className="hidden h-8 w-px bg-border sm:block" />
          <Select
            value={locationId}
            onValueChange={(value) => {
              setLocationId(value);
              setPage(1);
              setSelectedBookingId(null);
            }}
          >
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="button" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add booking
        </Button>
      </div>

      <div className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total" value={summary.total} helper="Bookings" />
          <StatCard label="Active now" value={summary.active} helper="Reserved + Booked + Occupied" />
          <StatCard label="Completed" value={summary.completed} helper={summary.completedHelper} />
          <StatCard label="Revenue" value={`Rs ${summary.revenue.toFixed(0)}`} helper="Paid / completed" />
        </div>

        <Card className="overflow-hidden rounded-lg">
          <ResizablePanelGroup orientation="horizontal" className="hidden lg:flex">
            <ResizablePanel defaultSize={selectedBooking ? 70 : 100} minSize={50}>
              <BookingsTablePane
                title={
                  locationId === "ALL"
                    ? "All Bookings"
                    : locations.find((location) => location.id === locationId)?.name ?? "Bookings"
                }
                search={search}
                statusFilter={statusFilter}
                isLoading={isLoading}
                isError={isError}
                bookings={pagedBookings}
                selectedBookingId={selectedBookingId}
                page={page}
                totalPages={totalPages}
                totalCount={filteredBookings.length}
                onSearchChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
                onStatusFilterChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
                onSelectBooking={selectBooking}
                onPageChange={setPage}
                onAction={runAction}
                isMutating={statusMutation.isPending}
              />
            </ResizablePanel>
            {selectedBooking && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                  <BookingDetailPanel
                    booking={selectedBooking}
                    isMutating={statusMutation.isPending}
                    onClose={() => setSelectedBookingId(null)}
                    onAction={runAction}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>

          <div className="lg:hidden">
            <BookingsTablePane
              title="All Bookings"
              search={search}
              statusFilter={statusFilter}
              isLoading={isLoading}
              isError={isError}
              bookings={pagedBookings}
              selectedBookingId={selectedBookingId}
              page={page}
              totalPages={totalPages}
              totalCount={filteredBookings.length}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
              onStatusFilterChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              onSelectBooking={selectBooking}
              onPageChange={setPage}
              onAction={runAction}
              isMutating={statusMutation.isPending}
            />
          </div>
        </Card>
      </div>

      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Booking details</SheetTitle>
            <SheetDescription>Review booking and customer information.</SheetDescription>
          </SheetHeader>
          {selectedBooking && (
            <BookingDetailPanel
              booking={selectedBooking}
              isMutating={statusMutation.isPending}
              onClose={() => setIsDetailSheetOpen(false)}
              onAction={runAction}
            />
          )}
        </SheetContent>
      </Sheet>

      <AddOnSiteBookingDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  );
}

function BookingsTablePane({
  title,
  search,
  statusFilter,
  isLoading,
  isError,
  bookings,
  selectedBookingId,
  page,
  totalPages,
  totalCount,
  isMutating,
  onSearchChange,
  onStatusFilterChange,
  onSelectBooking,
  onPageChange,
  onAction,
}: {
  title: string;
  search: string;
  statusFilter: StatusFilter;
  isLoading: boolean;
  isError: boolean;
  bookings: VendorBooking[];
  selectedBookingId: string | null;
  page: number;
  totalPages: number;
  totalCount: number;
  isMutating: boolean;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSelectBooking: (booking: VendorBooking) => void;
  onPageChange: (page: number) => void;
  onAction: (booking: VendorBooking, action: VendorBookingAction) => void;
}) {
  return (
    <div className="flex min-h-[680px] flex-col">
      <div className="flex flex-col gap-4 border-b p-5 xl:flex-row xl:items-center xl:justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 sm:w-[260px]"
              placeholder="Search..."
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value: StatusFilter) => onStatusFilterChange(value)}
          >
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
              <SelectItem value="BOOKED">Booked</SelectItem>
              <SelectItem value="CHECKED_IN">Checked in</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="PAYMENT_PENDING">Payment pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Customer / Driver</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                  Loading bookings...
                </TableCell>
              </TableRow>
            )}
            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-destructive">
                  Failed to load bookings.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
            {bookings.map((booking) => {
              const bookingId = getBookingId(booking);
              const selected = selectedBookingId === bookingId;
              return (
                <TableRow
                  key={bookingId}
                  className={cn(
                    "cursor-pointer",
                    selected && "bg-primary/10 hover:bg-primary/10",
                  )}
                  onClick={() => onSelectBooking(booking)}
                >
                  <TableCell className="font-mono text-sm">
                    {bookingId.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{getCustomerName(booking)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getCustomerPhone(booking)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getSourceLabel(booking)}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md border bg-muted/30 px-2 py-1 text-sm">
                      {booking.parkingLocationName ?? "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-sm font-semibold text-primary">
                      {getSlot(booking)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[130px]">
                      <p className="font-medium">
                        {formatTime(booking.startTime)}-{formatTime(booking.endTime)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(booking.startTime)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">{formatAmount(booking)}</TableCell>
                  <TableCell>
                    <div className="flex min-w-[120px] flex-col gap-1">
                      <span>{booking.paymentMethod ?? "-"}</span>
                      <Badge
                        className="w-fit"
                        variant={getPaymentStatusVariant(booking.paymentStatus)}
                      >
                        {booking.paymentStatus ?? "-"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge booking={booking} />
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    {canCheckIn(booking) && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => onAction(booking, "CHECK_IN")}
                      >
                        Check in
                      </Button>
                    )}
                    {canComplete(booking) && (
                      <Button
                        type="button"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => onAction(booking, "COMPLETE")}
                      >
                        Mark complete
                      </Button>
                    )}
                    {!canCheckIn(booking) && !canComplete(booking) && (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t p-4 text-sm text-muted-foreground">
        <span>
          {totalCount === 0
            ? "0 bookings"
            : `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, totalCount)} of ${totalCount}`}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Prev
          </Button>
          <span className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground">
            {page}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
