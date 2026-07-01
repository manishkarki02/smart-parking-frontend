import { ChartNoAxesColumn } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AdminBookingStatusCount } from "@/features/admin/types/admin.types";
import { cn } from "@/lib/utils";

type AdminBookingStatusCardProps = {
  counts: AdminBookingStatusCount;
};

type StatusRow = {
  label: string;
  value: number;
  className: string;
};

export function AdminBookingStatusCard({ counts }: AdminBookingStatusCardProps) {
  const rows: StatusRow[] = [
    {
      label: "Occupied",
      value: counts.occupied,
      className: "bg-orange-500",
    },
    {
      label: "Completed",
      value: counts.completed,
      className: "bg-green-500",
    },
    {
      label: "Cancelled",
      value: counts.cancelled,
      className: "bg-destructive",
    },
  ];
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Card className="rounded-lg border shadow-none">
      <CardHeader className="gap-1 pb-3">
        <CardTitle>Booking Status</CardTitle>
        <CardDescription>Operational status summary.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {total === 0 ? (
          <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-4 text-center">
            <ChartNoAxesColumn
              className="mb-2 size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">No booking status data</p>
            <p className="text-xs text-muted-foreground">
              Counts will appear after bookings are created.
            </p>
          </div>
        ) : (
          rows.map((row) => {
            const percentage = total > 0 ? (row.value / total) * 100 : 0;

            return (
              <div key={row.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{row.label}</span>
                  <span className="text-muted-foreground">{row.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", row.className)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
