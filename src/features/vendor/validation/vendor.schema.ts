import { z } from "zod";

export const addParkingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.coerce.number({ message: "Latitude is required" }),
  longitude: z.coerce.number({ message: "Longitude is required" }),
  totalSlots: z.coerce
    .number({ message: "Total slots is required" })
    .positive("Total slots must be a positive number"),
});

export type AddParkingFormValues = z.infer<typeof addParkingSchema>;
