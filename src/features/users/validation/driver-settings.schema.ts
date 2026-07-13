import z from "zod/v4";

export const driverProfileSchema = z.object({
  name: z.string().trim().min(1, "Full name is required."),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is required.")
    .max(20, "Phone number must be less than 20 characters.")
    .regex(/^[+\d\s()-]+$/, "Enter a valid phone number."),
});

export const driverPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters.")
      .max(72, "Password must be less than 72 characters."),
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from current password.",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type DriverProfileFormValues = z.infer<typeof driverProfileSchema>;
export type DriverPasswordFormValues = z.infer<typeof driverPasswordSchema>;
