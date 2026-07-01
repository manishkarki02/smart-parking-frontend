import { Card, CardContent } from "@/components/ui/card";
import type { VendorBookingSummary } from "@/features/vendor/types/vendor-booking.types";

function VendorBookingStatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-3 text-3xl font-bold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

export function VendorBookingSummaryCards({
  summary,
}: {
  summary: VendorBookingSummary;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <VendorBookingStatCard
        label="Total"
        value={summary.total}
        helper="Bookings"
      />
      <VendorBookingStatCard
        label="Active now"
        value={summary.active}
        helper="Reserved + Booked + Occupied"
      />
      <VendorBookingStatCard
        label="Completed"
        value={summary.completed}
        helper={summary.completedHelper}
      />
      <VendorBookingStatCard
        label="Revenue"
        value={`Rs ${summary.revenue.toFixed(0)}`}
        helper="Paid / completed"
      />
    </div>
  );
}
