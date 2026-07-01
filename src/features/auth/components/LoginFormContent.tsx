import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginSchema } from "../validations/auth.schema";
import useLoginMutation from "../hooks/useLoginMutation";

interface LoginFormContentProps {
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
  onRegisterClick?: () => void;
}

export function LoginFormContent({
  onSuccess,
  onOpenChange,
  onRegisterClick,
}: LoginFormContentProps) {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation({ onSuccess, onOpenChange });

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 pb-8 sm:px-8">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Email Address
        </Label>

        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="h-12 rounded-lg border-slate-200 bg-white pr-12 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:ring-blue-100"
            {...register("email")}
          />

          <Mail className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
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
          className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
        >
          Password
        </Label>

        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            className="h-12 rounded-lg border-slate-200 bg-white pr-12 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:ring-blue-100"
            {...register("password")}
          />

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
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

      <Button
        type="submit"
        className="h-12 w-full rounded-lg bg-blue-600 text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending && (
          <Loader2 className="mr-2 size-4 animate-spin" />
        )}
        Sign In
      </Button>

      <p className="pt-2 text-center text-sm text-slate-500">
        New to Smart Parking?{" "}
        <Link
          to="/register"
          onClick={onRegisterClick}
          className="font-semibold text-blue-600 underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}