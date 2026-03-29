import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { getAllBookings } from "@/features/admin/services/admin.service";
import { BookingsTable } from "@/features/admin/components/BookingsTable";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { PageHeader } from "@/common/components/PageHeader";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/admin/bookings")({
  beforeLoad: () => {
    if (useAuthStore.getState().user?.role !== "ADMIN") {
      throw redirect({ to: "/" });
    }
  },
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.admin.bookings,
    queryFn: getAllBookings,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Bookings"
        description="View all bookings across the system"
      />

      <Card className="rounded-none sm:rounded-lg overflow-hidden">
        {isLoading ? <LoadingSpinner /> : <BookingsTable bookings={bookings} />}
      </Card>
    </div>
  );
}
