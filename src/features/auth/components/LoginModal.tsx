import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Car } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { loginSchema, type LoginFormValues } from "@/features/auth/validation/auth.schema";
import { loginUser } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import { Link, useNavigate } from "@tanstack/react-router";

interface LoginModalProps {
  children?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginModal({ children, open, onOpenChange, onSuccess }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(loginSchema as any),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await loginUser(data);
      setAuth(response.token, {
        name: response.name,
        email: response.email,
        role: response.role,
      });
      toast.success("Login successful!");
      reset();
      
      if (response.role === "ADMIN") {
        navigate({ to: "/dashboard" });
      } else if (response.role === "VENDOR") {
        navigate({ to: "/vendor/parking" });
      } else {
        // Driver stays on current page and triggers onSuccess
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || "Login failed"
          : "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Car className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-2xl text-center">Welcome Back</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to your Smart Parking account
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="modal-email">Email</Label>
            <Input
              id="modal-email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-password">Password</Label>
            <Input
              id="modal-password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link
              to="/register"
              onClick={() => onOpenChange(false)}
              className="text-primary underline-offset-4 hover:underline"
            >
              Register
            </Link>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
