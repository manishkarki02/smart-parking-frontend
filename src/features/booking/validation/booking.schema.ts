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
        return new Date(data.endTime) > new Date(data.startTime);
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  )
  .refine(
    (data) => {
      if (data.startTime) {
        return new Date(data.startTime) > new Date();
      }
      return true;
    },
    {
      message: "Start time must be in the future",
      path: ["startTime"],
    }
  );

export type BookingFormValues = z.infer<typeof bookingSchema>;
