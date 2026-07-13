import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({
  label = "Loading...",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="size-6 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
