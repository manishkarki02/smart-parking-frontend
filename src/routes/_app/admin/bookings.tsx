import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllBookings } from "@/features/admin/services/admin.service";
import { BookingsTable } from "@/features/admin/components/BookingsTable";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";
import { PageHeader } from "@/common/components/PageHeader";
import { Card } from "@/components/ui/card";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";

export const Route = createFileRoute("/_app/admin/bookings")({
  component: AdminBookingsPage,
});

function AdminBookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["ADMIN"] });
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: queryKeys.admin.bookings(),
    queryFn: getAllBookings,
    enabled: isAuthorized,
  });

  if (!isAuthorized) {
    return null;
  }

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
