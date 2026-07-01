import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
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
                value={parkingLocationId}
                onValueChange={(value) => {
                  form.setValue("parkingLocationId", value, {
                    shouldValidate: true,
                  });
                  form.setValue("slotId", "");
                }}
              >
                <SelectTrigger id="parkingLocationId" className="w-full">
                  <SelectValue
                    placeholder={locationsLoading ? "Loading..." : "Select location"}
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
              {form.formState.errors.parkingLocationId && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.parkingLocationId.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="vehicleType">Vehicle type</Label>
              <Select
                value={vehicleType}
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
              value={slotId}
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
                value={paymentMethod}
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
              <Input
                id="startTime"
                type="datetime-local"
                {...form.register("startTime")}
              />
              {form.formState.errors.startTime && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.startTime.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">Expected end time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...form.register("endTime")}
              />
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
