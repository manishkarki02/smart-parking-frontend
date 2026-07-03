import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DetailItem({
  label,
  value,
  title,
  className,
}: {
  label: string;
  value?: ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 text-sm",
        className,
      )}
    >
      <p className="text-muted-foreground">{label}</p>
      <div
        className="min-w-0 justify-self-end break-words text-right font-medium"
        title={title}
      >
        {value || "-"}
      </div>
    </div>
  );
}
