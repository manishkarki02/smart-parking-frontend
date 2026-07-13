import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { LoginFormContent } from "./LoginFormContent";

interface LoginModalProps {
  children?: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function LoginModal({
  children,
  open,
  onOpenChange,
  onSuccess,
}: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="overflow-hidden rounded-[2rem] border-slate-200 bg-white p-0 shadow-[0_18px_60px_rgba(37,99,235,0.10)] sm:max-w-124">
        <DialogHeader className="px-6 pt-8 text-center sm:px-8">
          <DialogTitle className="text-3xl font-black tracking-tight text-slate-900">
            Welcome back
          </DialogTitle>

          <DialogDescription className="text-sm leading-6 text-slate-500">
            Sign in with your email and password to continue.
          </DialogDescription>
        </DialogHeader>

        <LoginFormContent
          onSuccess={onSuccess}
          onOpenChange={onOpenChange}
          onRegisterClick={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
