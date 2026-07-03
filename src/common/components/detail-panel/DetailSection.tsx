import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DetailSection({
  title,
  icon: Icon,
  children,
  className,
  titleClassName,
  contentClassName,
}: {
  title?: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn("space-y-3 border-t pt-4 first:border-t-0 first:pt-0", className)}>
      {title ? (
        <h3
          className={cn(
            "flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
            titleClassName,
          )}
        >
          {Icon ? (
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
          ) : null}
          {title}
        </h3>
      ) : null}
      <div className={cn("space-y-3", contentClassName)}>{children}</div>
    </section>
  );
}
