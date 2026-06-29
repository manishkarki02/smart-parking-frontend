import { useNavigate } from "@tanstack/react-router";
import { logoutAllSessions } from "../services/auth.service";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";

export default function useLogoutMutation() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const { isPending, mutateAsync } = useCustomMutation({
    api: async () => {
      try {
        await logoutAllSessions();
        return true;
      } catch {
        toast.error("Unable to reach the server while logging out.");
        return false;
      } finally {
        logout();
      }
    },
    error: "Logout failed",
    onSuccess: (didLogoutOnServer) => {
      if (didLogoutOnServer) {
        toast.success("Logged out from all devices successfully!");
      }
      navigate({ to: "/login" });
    },
  });
  return { isPending, mutateAsync };
}
