import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function QueryErrorState({
  title,
  message = "Please try again.",
  retryLabel = "Retry",
  isRetrying = false,
  showIcon = true,
  onRetry,
  className,
  contentClassName,
  titleClassName,
  messageClassName,
}: {
  title: string;
  message?: string;
  retryLabel?: string;
  isRetrying?: boolean;
  showIcon?: boolean;
  onRetry: () => void;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  messageClassName?: string;
}) {
  return (
    <Card className={cn("rounded-lg border shadow-none", className)}>
      <CardContent
        className={cn(
          "flex min-h-[420px] flex-col items-center justify-center gap-4 p-6 text-center",
          contentClassName,
        )}
      >
        {showIcon ? (
          <div className="flex size-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <RefreshCw className="size-6" aria-hidden="true" />
          </div>
        ) : null}
        <div className="space-y-1">
          <h1 className={cn("text-xl font-semibold", titleClassName)}>
            {title}
          </h1>
          <p
            className={cn(
              "max-w-md text-sm text-muted-foreground",
              messageClassName,
            )}
          >
            {message}
          </p>
        </div>
        <Button type="button" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className="size-4" aria-hidden="true" />
          {retryLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
