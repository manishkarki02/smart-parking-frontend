import { z } from "zod/v4";

export const driverBookingSchema = z
  .object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return new Date(data.endTime).getTime() > new Date(data.startTime).getTime();
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export type DriverBookingFormValues = z.infer<typeof driverBookingSchema>;
