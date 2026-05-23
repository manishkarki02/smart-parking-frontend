import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { useAuthStore } from "@/store/auth-store";
import { getAuthHomePath } from "@/features/auth/utils/get-auth-home-path";
import { z } from "zod";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/_public/login")({
  validateSearch: searchSchema,
  beforeLoad: () => {
    const auth = useAuthStore.getState();
    if (auth.isAuthenticated()) {
      throw redirect({ to: getAuthHomePath(auth.user) });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect: redirectTo } = Route.useSearch();

  return <LoginForm redirectTo={redirectTo} />;
}
