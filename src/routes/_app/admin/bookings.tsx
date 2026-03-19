import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getAllBookings } from "@/features/admin/services/admin.service";
import { BookingsTable } from "@/features/admin/components/BookingsTable";
import { LoadingSpinner } from "@/common/components/LoadingSpinner";
import { queryKeys } from "@/config/query-keys";

export const Route = createFileRoute("/_app/admin/bookings")({
  beforeLoad: () => {
    // Role guard disabled for UI testing
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
      <div>
        <h1 className="text-3xl font-bold">All Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View all bookings across the system
        </p>
      </div>

      {isLoading ? <LoadingSpinner /> : <BookingsTable bookings={bookings} />}
    </div>
  );
}
