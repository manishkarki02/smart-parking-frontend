import { z } from "zod/v4";

const requiredNumber = (schema: z.ZodNumber) =>
  z.preprocess(
    (value) => (value === "" || value == null ? undefined : Number(value)),
    schema,
  );

export const addParkingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: requiredNumber(z.number({ message: "Latitude is required" })),
  longitude: requiredNumber(z.number({ message: "Longitude is required" })),
  totalFourWheelerSlots: requiredNumber(
    z.number({ message: "4W slots is required" }).min(
      0,
      "4W slots cannot be negative",
    ),
  ),
  totalTwoWheelerSlots: requiredNumber(
    z.number({ message: "2W slots is required" }).min(
      0,
      "2W slots cannot be negative",
    ),
  ),
  fourWheelerRatePerHour: requiredNumber(
    z.number({ message: "4W rate is required" }).positive(
      "4W rate must be greater than zero",
    ),
  ),
  twoWheelerRatePerHour: requiredNumber(
    z.number({ message: "2W rate is required" }).positive(
      "2W rate must be greater than zero",
    ),
  ),
}).refine(
  (data) => data.totalFourWheelerSlots + data.totalTwoWheelerSlots > 0,
  {
    message: "At least one slot is required",
    path: ["totalFourWheelerSlots"],
  },
);

export interface AddParkingFormValues {
  [key: string]: string | number;
  name: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
  totalFourWheelerSlots: string | number;
  totalTwoWheelerSlots: string | number;
  fourWheelerRatePerHour: string | number;
  twoWheelerRatePerHour: string | number;
}

export type AddParkingPayload = z.output<typeof addParkingSchema>;
