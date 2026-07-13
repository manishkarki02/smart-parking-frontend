import type { ReactNode } from "react";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import type { AuthUser } from "@/stores/auth-store";

export function RouteGuard({
  allowedRoles,
  children,
}: {
  allowedRoles?: AuthUser["role"][];
  children: ReactNode;
}) {
  const { isAuthorized } = useAuthGuard({ allowedRoles });

  if (!isAuthorized) {
    return null;
  }

  return children;
}
