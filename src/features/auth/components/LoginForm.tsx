import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
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
import { loginSchema, type LoginSchema } from "../validations/auth.schema";
import useLoginMutation from "../hooks/useLoginMutation";
import { AuthLayout } from "./AuthLayout";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    await loginMutation.mutateAsync(data);
  };

  return (
    <AuthLayout>
      <Card className="rounded-[2rem] border-[#E2E8F0] bg-white p-0 shadow-[0_18px_60px_rgba(37,99,235,0.10)]">
        <CardHeader className="px-6 pt-8 text-center sm:px-8">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB] ring-1 ring-blue-100">
            <Car className="size-7" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight text-[#0F172A]">
            Welcome back
          </CardTitle>
          <CardDescription className="pt-2 text-sm leading-6 text-[#64748B]">
            Sign in with your email and password to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8 sm:px-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between gap-4 text-sm">
              <label className="flex items-center gap-2 font-medium text-[#64748B]">
                <input
                  type="checkbox"
                  className="size-4 rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
                />
                Remember me
              </label>
              <div className="flex items-center gap-1 text-[#94A3B8]">
                <Lock className="size-4" />
                <span>Secure login</span>
              </div>
            </div>

            <Button
              type="submit"
              className="h-12 w-full rounded-lg bg-[#2563EB] text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Sign In
            </Button>

            <p className="pt-2 text-center text-sm text-[#64748B]">
              New to Smart Parking?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#2563EB] underline-offset-4 hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
