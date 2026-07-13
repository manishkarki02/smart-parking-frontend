import { Roles } from "@/config/enums";
import z from "zod/v4";

export const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address")
    .max(150, "Email must be less than 150 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be less than 72 characters"),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z
      .email("Please enter a valid email address")
      .max(150, "Email must be less than 150 characters"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be less than 72 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z
      .string()
      .min(7, "Phone number is required")
      .max(20, "Phone number must be less than 20 characters"),
    role: z.enum(Object.values(Roles), {
      error: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
