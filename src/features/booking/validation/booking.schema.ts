import { z } from "zod/v4";

export const bookingSchema = z
  .object({
    parkingLocationId: z.coerce
      .number({ message: "Please select a parking location" })
      .positive("Please select a parking location"),
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
