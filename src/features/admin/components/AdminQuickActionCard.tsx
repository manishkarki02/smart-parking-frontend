import { Link } from "@tanstack/react-router";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminQuickActionCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  tone?: "blue" | "green" | "purple" | "orange";
};

const toneClasses: Record<NonNullable<AdminQuickActionCardProps["tone"]>, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
  orange: "bg-orange-50 text-orange-600",
};

export function AdminQuickActionCard({
  title,
  description,
  icon: Icon,
  to,
  tone = "blue",
}: AdminQuickActionCardProps) {
  return (
    <Card className="group gap-0 rounded-lg border shadow-none transition-colors hover:border-primary/40">
      <CardContent className="p-0">
        <Link
          to={to}
          className="flex h-full items-center justify-between gap-4 rounded-lg p-4 outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                toneClasses[tone],
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium text-foreground">{title}</span>
              <span className="block truncate text-sm text-muted-foreground">
                {description}
              </span>
            </span>
          </span>
          <ArrowRight
            className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </CardContent>
    </Card>
  );
}
