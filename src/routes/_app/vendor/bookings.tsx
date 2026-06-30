import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DataTable, { type ColumnDef } from "@/common/components/DataTable";
import { PageHeader } from "@/common/components/PageHeader";
import { ConfirmDialog } from "@/common/components/ConfirmDialog";
import useCustomMutation from "@/common/hooks/useCustomMutation";
import useCustomQuery from "@/common/hooks/useCustomQuery";
import { useAuthGuard } from "@/common/hooks/use-auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/config/query-keys";
import {
  getVendorBookings,
  updateBookingStatus,
  type VendorBooking,
} from "@/features/bookings/services/booking.service";

export const Route = createFileRoute("/_app/vendor/bookings")({
  component: VendorBookingsPage,
});

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
    case "COMPLETED":
      return "default";
    case "PENDING":
      return "secondary";
    case "REJECTED":
    case "CANCELLED":
      return "destructive";
    default:
      return "outline";
  }
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function getDriverName(booking: VendorBooking): string {
  return booking.driver?.name ?? booking.user?.name ?? "N/A";
}

function getSlot(booking: VendorBooking): string {
  return String(booking.slot ?? booking.slotNumber ?? "N/A");
}

function getAmount(booking: VendorBooking): string {
  return `Rs. ${booking.amount ?? booking.totalAmount ?? 0}`;
}

function VendorBookingsPage() {
  const { isAuthorized } = useAuthGuard({ allowedRoles: ["VENDOR"] });
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(
    null,
  );

  const { data, isLoading } = useCustomQuery({
    key: queryKeys.bookings.vendor({ search, page }),
    queryFn: () => getVendorBookings({ search, page }),
    options: {
      enabled: isAuthorized,
    },
  });

  const invalidateBookings = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.bookings.vendor() });
  };

  const statusMutation = useCustomMutation({
    api: updateBookingStatus,
    onSuccess: () => {
      setRejectingBookingId(null);
      invalidateBookings();
      toast.success("Booking status updated");
    },
  });

  const columns: ColumnDef<VendorBooking>[] = [
    {
      key: "id",
      header: "Booking ID",
      className: "font-mono",
      cell: (booking) => String(booking.id).slice(0, 8),
    },
    {
      key: "driver",
      header: "Driver name",
      cell: getDriverName,
    },
    {
      key: "startTime",
      header: "Start time",
      cell: (booking) => formatDateTime(booking.startTime),
    },
    {
      key: "endTime",
      header: "End time",
      cell: (booking) => formatDateTime(booking.endTime),
    },
    {
      key: "slot",
      header: "Slot",
      cell: getSlot,
    },
    {
      key: "status",
      header: "Status",
      cell: (booking) => (
        <Badge variant={getStatusVariant(booking.status)}>
          {booking.status}
        </Badge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      cell: getAmount,
    },
  ];

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <PageHeader title="Bookings" />
      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        page={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        emptyMessage="No bookings found"
        rowActions={(booking) => {
          const status = booking.status.toUpperCase();

          return (
            <>
              {status === "PENDING" && (
                <Button
                  type="button"
                  size="sm"
                  disabled={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate({
                      id: booking.id,
                      status: "CONFIRMED",
                    })
                  }
                >
                  Confirm
                </Button>
              )}
              {status === "CONFIRMED" && (
                <Button
                  type="button"
                  size="sm"
                  disabled={statusMutation.isPending}
                  onClick={() =>
                    statusMutation.mutate({
                      id: booking.id,
                      status: "COMPLETED",
                    })
                  }
                >
                  Complete
                </Button>
              )}
              {(status === "PENDING" || status === "CONFIRMED") && (
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => setRejectingBookingId(String(booking.id))}
                >
                  Reject
                </Button>
              )}
            </>
          );
        }}
      />

      <ConfirmDialog
        open={rejectingBookingId !== null}
        onOpenChange={(open) => !open && setRejectingBookingId(null)}
        title="Reject this booking?"
        description="This action cannot be undone."
        confirmLabel="Reject"
        onConfirm={() => {
          if (rejectingBookingId) {
            statusMutation.mutate({
              id: rejectingBookingId,
              status: "REJECTED",
            });
          }
        }}
        isLoading={statusMutation.isPending}
      />
    </>
  );
}
