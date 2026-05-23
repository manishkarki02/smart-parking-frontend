import type { AuthUser } from "@/store/auth-store";

export type AuthHomePath = "/dashboard" | "/vendor/dashboard" | "/parking/map";

export function getAuthHomePath(user: AuthUser | null): AuthHomePath {
  console.log("Determining home path for user:", user);
  if (user?.role === "ADMIN") {
    return "/dashboard";
  }

  if (user?.role === "VENDOR") {
    return "/vendor/dashboard";
  }

  return "/parking/map";
}
