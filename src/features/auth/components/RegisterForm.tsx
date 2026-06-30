import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Car,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Roles } from "@/config/enums";
import {
  registerSchema,
  type RegisterSchema,
} from "../validations/auth.schema";
import useRegisterMutation from "../hooks/useRegisterMutation";
import { AuthLayout } from "./AuthLayout";

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: Roles.DRIVER,
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role,
    };
    await registerMutation.mutateAsync(payload);
  };

  return (
    <AuthLayout>
      <Card className="rounded-[2rem] border-[#E2E8F0] bg-white p-0 shadow-[0_18px_60px_rgba(37,99,235,0.10)]">
        <CardHeader className="px-6 pt-8 text-center sm:px-8">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] ring-1 ring-blue-100">
            <Car className="size-7" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-[#0F172A]">
            Create your account
          </CardTitle>
          <CardDescription className="pt-2 text-sm leading-6 text-[#64748B]">
            Register as a driver or admin for Smart Parking.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold text-[#0F172A]">
                Full Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  placeholder="John Doe"
                  autoComplete="name"
                  className="h-12 rounded-lg border-[#E2E8F0] bg-white pr-12 text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
                  {...register("name")}
                />
                <User className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#94A3B8]" />
              </div>
              {errors.name && (
                <p className="text-sm font-medium text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-[#0F172A]">
                Email Address
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="h-12 rounded-lg border-[#E2E8F0] bg-white pr-12 text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
                  {...register("email")}
                />
                <Mail className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#94A3B8]" />
              </div>
              {errors.email && (
                <p className="text-sm font-medium text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="font-semibold text-[#0F172A]"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className="h-12 rounded-lg border-[#E2E8F0] bg-white pr-12 text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#94A3B8] transition hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm font-medium text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="font-semibold text-[#0F172A]"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className="h-12 rounded-lg border-[#E2E8F0] bg-white pr-12 text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#94A3B8] transition hover:text-[#0F172A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-5" />
                  ) : (
                    <Eye className="size-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold text-[#0F172A]">
                Phone Number
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  placeholder="9800000000"
                  autoComplete="tel"
                  className="h-12 rounded-lg border-[#E2E8F0] bg-white pr-12 text-[#0F172A] shadow-sm placeholder:text-[#94A3B8] focus-visible:ring-blue-100"
                  {...register("phone")}
                />
                <Phone className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#94A3B8]" />
              </div>
              {errors.phone && (
                <p className="text-sm font-medium text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-[#0F172A]">Role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-12 w-full rounded-lg border-[#E2E8F0] bg-white px-4 text-sm text-[#0F172A] shadow-sm focus:ring-4 focus:ring-blue-100">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Roles.DRIVER}>Driver</SelectItem>
                      <SelectItem value={Roles.VENDOR}>Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm font-medium text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-lg bg-[#2563EB] text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Create Account
            </Button>

            <p className="pt-2 text-center text-sm text-[#64748B]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#2563EB] underline-offset-4 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
