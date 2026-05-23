import useCustomMutation from "@/common/hooks/useCustomMutation";
import { useNavigate } from "@tanstack/react-router";
import { registerUser } from "../services/auth.service";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/common/utils/get-api-error-message";

function useRegisterMutation() {
  const navigate = useNavigate();

  const { isPending, mutateAsync } = useCustomMutation({
    api: registerUser,
    success: "Registration successful! Please login.",
    error: "Registration failed",
    onSuccess: () => navigate({ to: "/login" }),
    onError: (error) => {
      const message = getApiErrorMessage(error);
      console.log("Registration error:", error.response?.data ?? error);
      if (typeof message === "string") {
        toast.error(message);
      }
    },
  });
  return { isPending, mutateAsync };
}

export default useRegisterMutation;
