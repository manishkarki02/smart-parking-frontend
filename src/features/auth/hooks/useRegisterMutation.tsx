import useCustomMutation from "@/common/hooks/useCustomMutation";
import { useNavigate } from "@tanstack/react-router";
import { registerUser } from "../services/auth.service";
import { toast } from "sonner";

function useRegisterMutation() {
  const navigate = useNavigate();

  const { isPending, mutateAsync } = useCustomMutation({
    api: registerUser,
    success: "Registration successful! Please login.",
    error: "Registration failed",
    onSuccess: () => navigate({ to: "/login" }),
    onError: (error) => {
      toast.error(error.message);
    },
  });
  return { isPending, mutateAsync };
}

export default useRegisterMutation;
