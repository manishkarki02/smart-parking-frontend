import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { AuthLayout } from "./AuthLayout";
import { LoginFormContent } from "./LoginFormContent";

export function LoginForm() {
  return (
    <AuthLayout>
      <Card className="rounded-[2rem] border-slate-200 bg-white p-0 shadow-[0_18px_60px_rgba(37,99,235,0.10)]">
        <CardHeader className="px-6 pt-8 text-center sm:px-8">
          <CardTitle className="text-3xl font-black tracking-tight text-slate-900">
            Welcome back
          </CardTitle>

          <CardDescription className="text-sm leading-6 text-slate-500">
            Sign in with your email and password to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <LoginFormContent />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
