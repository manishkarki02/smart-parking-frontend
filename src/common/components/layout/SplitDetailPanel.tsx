import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SplitDetailPanel({
  title,
  subtitle,
  onClose,
  children,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <aside className="flex h-full min-h-0 flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
      {(title || subtitle) && (
        <div className="flex items-start justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            {title ? (
              <h2 className="truncate text-base font-semibold">{title}</h2>
            ) : null}
            {subtitle ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={onClose}
            aria-label="Close detail panel"
          >
            <X className="size-4" />
          </Button>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </aside>
  );
}
