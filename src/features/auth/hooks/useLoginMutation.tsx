import useCustomMutation from "@/common/hooks/useCustomMutation";
import { loginUser } from "../services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";

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
      setAuth(data.accessToken, {
        id: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        banned: data.banned,
        approved: data.approved,
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
            navigate({ to: "/dashboard" });
          }
      }
    },
    onError: (error) => {
      const message = getApiErrorMessage(error);
      if (typeof message === "string") {
        toast.error(message);
      }
    },
  });

  return { mutateAsync, isPending };
}

export default useLoginMutation;
