import type { AuthUser } from "@/stores/auth-store";

export type AuthHomePath = "/dashboard" | "/vendor/dashboard";

export function getAuthHomePath(user: AuthUser | null): AuthHomePath {
  if (user?.role === "ADMIN") {
    return "/dashboard";
  }

  if (user?.role === "VENDOR") {
    return "/vendor/dashboard";
  }

  return "/dashboard";
}
