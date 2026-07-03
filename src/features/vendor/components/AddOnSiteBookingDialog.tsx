import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Bike,
  CalendarClock,
  Car,
  CreditCard,
  MapPin,
  ParkingCircle,
  Phone,
  Plus,
  ReceiptText,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";
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
import { FieldError } from "@/common/components/form/FieldError";
import { RequiredLabel } from "@/common/components/form/RequiredLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { queryKeys } from "@/config/query-keys";
import {
  onSiteBookingSchema,
  type OnSiteBookingFormValues,
} from "@/features/bookings/schemas/on-site-booking.schema";
import { getVendorSlots } from "@/features/parkings/services/parking.service";
import type { ParkingSlotVehicleType } from "@/features/parkings/types/parking.types";
import {
  createWalkInBooking,
  getMyParkingLocations,
} from "@/features/vendor/services/vendor.service";
import { toDateTimeInputValue } from "@/features/vendor/utils/vendor-booking.utils";

export function AddOnSiteBookingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const start = useMemo(() => new Date(), []);
  const defaultStartTime = toDateTimeInputValue(start);
  const defaultEndTime = toDateTimeInputValue(
    new Date(start.getTime() + 60 * 60_000),
  );

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

  const parkingLocationId = useWatch<
    OnSiteBookingFormValues,
    "parkingLocationId"
  >({
    control: form.control,
    name: "parkingLocationId",
  });
  const vehicleType = useWatch<OnSiteBookingFormValues, "vehicleType">({
    control: form.control,
    name: "vehicleType",
  });
  const slotId = useWatch<OnSiteBookingFormValues, "slotId">({
    control: form.control,
    name: "slotId",
  });
  const paymentMethod = useWatch<OnSiteBookingFormValues, "paymentMethod">({
    control: form.control,
    name: "paymentMethod",
  });
  const startTime = useWatch<OnSiteBookingFormValues, "startTime">({
    control: form.control,
    name: "startTime",
  });
  const endTime = useWatch<OnSiteBookingFormValues, "endTime">({
    control: form.control,
    name: "endTime",
  });

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
  const selectedLocation = locations.find(
    (location) => location.id === parkingLocationId,
  );
  const hourlyRate =
    vehicleType === "FOUR_WHEELER"
      ? selectedLocation?.fourWheelerRatePerHour
      : selectedLocation?.twoWheelerRatePerHour;
  const durationHours = useMemo(() => {
    const startValue = new Date(startTime).getTime();
    const endValue = new Date(endTime).getTime();
    if (!Number.isFinite(startValue) || !Number.isFinite(endValue)) {
      return 0;
    }
    return Math.max((endValue - startValue) / 3_600_000, 0);
  }, [endTime, startTime]);
  const estimatedAmount = durationHours * Number(hourlyRate ?? 0);

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
      void queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.vendorRoot(),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.vendor.dashboardRoot(),
      });
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
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-[720px]">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-2xl font-bold text-slate-950">
            Add on-site booking
          </DialogTitle>
          <DialogDescription className="text-base text-slate-500">
            Create a booking for a customer who arrived directly at the parking
            location.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex min-h-0 flex-col"
          onSubmit={form.handleSubmit(submit)}
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Parking location"
                error={form.formState.errors.parkingLocationId?.message}
              >
                <Select
                  value={parkingLocationId}
                  onValueChange={(value) => {
                    form.setValue("parkingLocationId", value, {
                      shouldValidate: true,
                    });
                    form.setValue("slotId", "");
                  }}
                >
                  <SelectTrigger className="h-12 w-full border-slate-200 text-base shadow-none">
                    <MapPin className="size-4 text-blue-600" />
                    <SelectValue
                      placeholder={
                        locationsLoading ? "Loading..." : "Select location"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </SelectField>

              <SelectField
                label="Vehicle type"
                error={form.formState.errors.vehicleType?.message}
              >
                <Select
                  value={vehicleType}
                  onValueChange={(value) => {
                    form.setValue(
                      "vehicleType",
                      value as ParkingSlotVehicleType,
                      { shouldValidate: true },
                    );
                    form.setValue("slotId", "");
                  }}
                >
                  <SelectTrigger className="h-12 w-full border-slate-200 text-base shadow-none">
                    {vehicleType === "FOUR_WHEELER" ? (
                      <Car className="size-4 text-blue-600" />
                    ) : (
                      <Bike className="size-4 text-slate-500" />
                    )}
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TWO_WHEELER">Two wheeler</SelectItem>
                    <SelectItem value="FOUR_WHEELER">Four wheeler</SelectItem>
                  </SelectContent>
                </Select>
              </SelectField>
            </div>

            <SelectField
              label="Available slot"
              error={form.formState.errors.slotId?.message}
            >
              <Select
                value={slotId}
                onValueChange={(value) =>
                  form.setValue("slotId", value, { shouldValidate: true })
                }
                disabled={
                  !parkingLocationId ||
                  slotsLoading ||
                  availableSlots.length === 0
                }
              >
                <SelectTrigger className="h-12 w-full border-slate-200 text-base shadow-none">
                  <ParkingCircle className="size-4 text-slate-500" />
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
            </SelectField>

            <FormSection title="Customer details">
              <TextField
                label="Customer name"
                icon={UserRound}
                error={form.formState.errors.customerName?.message}
              >
                <Input
                  placeholder="Customer name"
                  className="h-12 border-slate-200 pl-10 text-base shadow-none"
                  {...form.register("customerName")}
                />
              </TextField>
              <TextField
                label="Customer phone"
                icon={Phone}
                error={form.formState.errors.customerPhone?.message}
              >
                <Input
                  placeholder="98XXXXXXXX"
                  className="h-12 border-slate-200 pl-10 text-base shadow-none"
                  {...form.register("customerPhone")}
                />
              </TextField>
              <TextField
                label="Vehicle number"
                icon={Car}
                error={form.formState.errors.vehicleNumber?.message}
              >
                <Input
                  placeholder="BA 2 PA 1234"
                  className="h-12 border-slate-200 pl-10 text-base shadow-none"
                  {...form.register("vehicleNumber")}
                />
              </TextField>
              <SelectField
                label="Payment method"
                error={form.formState.errors.paymentMethod?.message}
              >
                <Select
                  value={paymentMethod}
                  onValueChange={(value) =>
                    form.setValue(
                      "paymentMethod",
                      value as OnSiteBookingFormValues["paymentMethod"],
                      { shouldValidate: true },
                    )
                  }
                >
                  <SelectTrigger className="h-12 w-full border-slate-200 text-base shadow-none">
                    <CreditCard className="size-4 text-slate-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="KHALTI">Khalti</SelectItem>
                    <SelectItem value="ESEWA">Esewa</SelectItem>
                  </SelectContent>
                </Select>
              </SelectField>
            </FormSection>

            <FormSection title="Timing">
              <TextField
                label="Start time"
                icon={CalendarClock}
                error={form.formState.errors.startTime?.message}
              >
                <Input
                  type="datetime-local"
                  className="h-12 border-slate-200 pl-10 text-base shadow-none"
                  {...form.register("startTime")}
                />
              </TextField>
              <TextField
                label="Expected end time"
                icon={CalendarClock}
                error={form.formState.errors.endTime?.message}
              >
                <Input
                  type="datetime-local"
                  className="h-12 border-slate-200 pl-10 text-base shadow-none"
                  {...form.register("endTime")}
                />
              </TextField>
            </FormSection>

            <div className="flex items-center justify-between gap-4 rounded-md border border-blue-200 bg-blue-50 p-4 text-blue-700">
              <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
                <ReceiptText className="size-4 shrink-0" />
                <span className="truncate">
                  Estimated amount ({durationHours.toFixed(0)} hr @ Rs{" "}
                  {Number(hourlyRate ?? 0).toFixed(0)}/hr)
                </span>
              </div>
              <p className="shrink-0 text-2xl font-bold">
                Rs {estimatedAmount.toFixed(2)}
              </p>
            </div>
          </div>

          <DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="h-11 min-w-28"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-11 min-w-44 bg-blue-600 hover:bg-blue-700"
              disabled={createMutation.isPending}
            >
              <Plus className="size-4" />
              Create booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SelectField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <RequiredLabel>{label}</RequiredLabel>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function TextField({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: typeof UserRound;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <RequiredLabel>{label}</RequiredLabel>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        {children}
      </div>
      <FieldError message={error} />
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-slate-200 pt-5">
      <p className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
