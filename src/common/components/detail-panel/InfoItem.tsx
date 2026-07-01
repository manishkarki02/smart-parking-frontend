import type { ReactNode } from "react";

interface InfoItemProps {
  label: string;
  value?: ReactNode;
  className?: string;
}

export function InfoItem({ label, value, className }: InfoItemProps) {
  return (
    <div className={className ?? "rounded-lg border bg-muted/20 p-3"}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 break-words text-sm font-medium">{value || "-"}</div>
    </div>
  );
}
