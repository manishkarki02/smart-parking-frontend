import { Banknote, Car, CheckCircle2, ClipboardList } from "lucide-react";
import type { ComponentType } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { VendorBookingSummary } from "@/features/vendor/types/vendor-booking.types";
import { cn } from "@/lib/utils";

type StatAccent = "blue" | "orange" | "green" | "purple";

const statAccentStyles: Record<StatAccent, string> = {
  blue: "bg-blue-50 text-blue-600",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
};

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: ComponentType<{ className?: string }>;
  accent: StatAccent;
}) {
  return (
    <Card className="border-slate-200 bg-white shadow-none">
      <CardContent className="p-5">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-md",
            statAccentStyles[accent],
          )}
        >
          <Icon className="size-4.5" />
        </span>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-1 text-sm text-slate-500">{helper}</p>
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
    <section className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Total"
        value={summary.total}
        helper="Bookings"
        icon={ClipboardList}
        accent="blue"
      />
      <SummaryCard
        label="Active now"
        value={summary.active}
        helper="Reserved + Booked + Occupied"
        icon={Car}
        accent="orange"
      />
      <SummaryCard
        label="Completed"
        value={summary.completed}
        helper={summary.completedHelper}
        icon={CheckCircle2}
        accent="green"
      />
      <SummaryCard
        label="Revenue"
        value={`Rs ${summary.revenue.toFixed(0)}`}
        helper="Paid / completed"
        icon={Banknote}
        accent="purple"
      />
    </section>
  );
}
