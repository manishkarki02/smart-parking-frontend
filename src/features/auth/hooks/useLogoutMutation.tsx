import { useNavigate } from "@tanstack/react-router";
import { logoutUser } from "../services/auth.service";
import useCustomMutation from "@/common/hooks/useCustomMutation";

export default function useLogoutMutation() {
  const navigate = useNavigate();
  const { isPending, mutateAsync } = useCustomMutation({
    api: logoutUser,
    success: "Logged out successfully!",
    error: "Logout failed",
    onSuccess: () => navigate({ to: "/" }),
  });
  return { isPending, mutateAsync };
}
