import { z } from "zod/v4";

export const addParkingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.coerce.number({ message: "Latitude is required" }),
  longitude: z.coerce.number({ message: "Longitude is required" }),
  totalFourWheelerSlots: z.coerce
    .number({ message: "4W slots is required" })
    .min(0, "4W slots cannot be negative"),
  totalTwoWheelerSlots: z.coerce
    .number({ message: "2W slots is required" })
    .min(0, "2W slots cannot be negative"),
  fourWheelerRatePerHour: z.coerce
    .number({ message: "4W rate is required" })
    .positive("4W rate must be greater than zero"),
  twoWheelerRatePerHour: z.coerce
    .number({ message: "2W rate is required" })
    .positive("2W rate must be greater than zero"),
}).refine(
  (data) => data.totalFourWheelerSlots + data.totalTwoWheelerSlots > 0,
  {
    message: "At least one slot is required",
    path: ["totalFourWheelerSlots"],
  },
);

export type AddParkingFormValues = z.input<typeof addParkingSchema>;
export type AddParkingPayload = z.output<typeof addParkingSchema>;
