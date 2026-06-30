import { z } from "zod/v4";

export const bookingSchema = z
  .object({
    parkingLocationId: z.coerce
      .string({ message: "Please select a parking location" })
      .min(1, "Please select a parking location"),
    slotId: z.string().min(1, "Please select a slot"),
    vehicleType: z.enum(["TWO_WHEELER", "FOUR_WHEELER"], {
      error: "Please select a vehicle type",
    }),
    vehicleNumber: z.string().min(1, "Vehicle number is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export type BookingFormValues = z.infer<typeof bookingSchema>;
