import { z } from "zod/v4";

export const walkInBookingSchema = z
  .object({
    customerName: z.string().trim().min(1, "Customer name is required"),
    customerPhone: z.string().trim().min(1, "Customer phone is required"),
    vehicleNumber: z.string().trim().min(1, "Vehicle number is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "Expected end time is required"),
    paymentMethod: z.enum(["CASH", "KHALTI", "ESEWA"], {
      error: "Payment method is required",
    }),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return Number.isFinite(start.getTime()) && Number.isFinite(end.getTime())
        ? end > start
        : false;
    },
    {
      message: "Expected end time must be after start time",
      path: ["endTime"],
    },
  );

export type WalkInBookingFormValues = z.infer<typeof walkInBookingSchema>;
