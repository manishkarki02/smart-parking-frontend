import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminMetricCardProps = {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  tone?: "blue" | "green" | "purple" | "orange";
};

const toneClasses: Record<NonNullable<AdminMetricCardProps["tone"]>, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
};

export function AdminMetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
}: AdminMetricCardProps) {
  return (
    <Card className="gap-0 rounded-lg border shadow-none">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-lg",
            toneClasses[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </CardContent>
    </Card>
  );
}
