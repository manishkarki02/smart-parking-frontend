import { z } from "zod/v4";

function parseDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const bookingSchema = z
  .object({
    parkingLocationId: z.coerce
      .string({ message: "Please select a parking location" })
      .min(1, "Please select a parking location"),
    slotId: z.string().min(1, "Please select a slot"),
    vehicleType: z.enum(["TWO_WHEELER", "FOUR_WHEELER"], {
      error: "Please select a vehicle type",
    }),
    vehicleNumber: z.string().trim().min(1, "Vehicle number is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => {
      if (!data.startTime) return true;
      const start = parseDateTime(data.startTime);
      if (!start) return false;
      return start.getTime() >= Date.now() - 5 * 60_000;
    },
    {
      message: "Start time cannot be earlier than the current time.",
      path: ["startTime"],
    },
  )
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      const start = parseDateTime(data.startTime);
      const end = parseDateTime(data.endTime);
      if (!start || !end) return false;
      return end.getTime() > start.getTime();
    },
    {
      message: "End time must be after start time.",
      path: ["endTime"],
    }
  );

export type BookingFormValues = z.infer<typeof bookingSchema>;
