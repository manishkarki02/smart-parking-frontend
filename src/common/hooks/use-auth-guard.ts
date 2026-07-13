import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { AuthUser } from "@/stores/auth-store";
import { useAuthStore } from "@/stores/auth-store";

type AuthRole = AuthUser["role"];

type UseAuthGuardOptions = {
  allowedRoles?: AuthRole[];
  loginPath?: string;
  unauthorizedPath?: string;
};

type UseAuthGuardResult = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthorized: boolean;
};

/**
 * Protects a route component by redirecting unauthenticated users to login and
 * role-mismatched users to a safe fallback route.
 */
export function useAuthGuard({
  allowedRoles,
  loginPath = "/login",
  unauthorizedPath = "/",
}: UseAuthGuardOptions = {}): UseAuthGuardResult {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  const isAuthenticated = Boolean(token);
  const isAuthorized =
    isAuthenticated &&
    (!allowedRoles?.length || Boolean(user && allowedRoles.includes(user.role)));

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({
        to: loginPath,
        replace: true,
      });
      return;
    }

    if (!isAuthorized) {
      void navigate({
        to: unauthorizedPath,
        replace: true,
      });
    }
  }, [
    isAuthenticated,
    isAuthorized,
    loginPath,
    navigate,
    unauthorizedPath,
  ]);

  return {
    user,
    isAuthenticated,
    isAuthorized,
  };
}
