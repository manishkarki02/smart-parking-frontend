import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function RequiredLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Label className={cn(className)}>
      {children} <span className="text-red-500">*</span>
    </Label>
  );
}
