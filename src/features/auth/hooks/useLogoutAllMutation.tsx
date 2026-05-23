import { useNavigate } from "@tanstack/react-router";
import { logoutAllSessions } from "../services/auth.service";
import useCustomMutation from "@/common/hooks/useCustomMutation";

export default function useLogoutMutation() {
  const navigate = useNavigate();

  const { isPending, mutateAsync } = useCustomMutation({
    api: logoutAllSessions,
    success: "Logged out from all devices successfully!",
    error: "Logout failed",
    onSuccess: () => {
      navigate({ to: "/" });
    },
  });
  return { isPending, mutateAsync };
}
