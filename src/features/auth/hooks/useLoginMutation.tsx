import useCustomMutation from "@/common/hooks/useCustomMutation";
import { loginUser } from "../services/auth.service";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

function useLoginMutation({
  onSuccess,
  onOpenChange,
}: {
  onSuccess?: () => void;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const navigate = useNavigate();

  const { setAuth } = useAuthStore();
  const { mutateAsync, isPending } = useCustomMutation({
    api: loginUser,
    success: "Login successful!",
    error: "Login failed",
    onSuccess: (data) => {
      setAuth(data.token, {
        name: data.name,
        email: data.email,
        role: data.role,
      });

      console.log("Login successful, user data:", {
        name: data.name,
        email: data.email,
        role: data.role,
      });

      toast.success("Login successful!");

      // Redirect based on role
      switch (data.role) {
        case "ADMIN":
          navigate({ to: "/dashboard" });
          break;
        case "VENDOR":
          navigate({ to: "/vendor/dashboard" });
          break;
        default:
          if (onSuccess || onOpenChange) {
            onSuccess?.();
            onOpenChange?.(false);
          } else {
            navigate({ to: "/" });
          }
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { mutateAsync, isPending };
}

export default useLoginMutation;
