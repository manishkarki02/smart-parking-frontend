import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";

type TableEmptyStateProps = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function TableEmptyState({
  title = "No data available",
  description = "There are no records to show right now.",
  action,
  icon = <Plus className="size-8 opacity-25" />,
  className,
}: TableEmptyStateProps) {
  return (
    <Empty className={cn("min-h-[420px] border-0 py-16", className)}>
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="mb-3 size-16 rounded-full bg-muted text-muted-foreground"
        >
          {icon}
        </EmptyMedia>
        <EmptyTitle className="text-xl font-semibold">{title}</EmptyTitle>
        <EmptyDescription className="max-w-md text-base">
          {description}
        </EmptyDescription>
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  );
}
