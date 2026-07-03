import { createFileRoute } from "@tanstack/react-router";
import { RouteGuard } from "@/common/components/RouteGuard";
import { DriverPaymentHistoryPage } from "@/features/payments/pages/DriverPaymentHistoryPage";

export const Route = createFileRoute("/_app/payments/")({
  component: PaymentsRoute,
});

function PaymentsRoute() {
  return (
    <RouteGuard allowedRoles={["DRIVER"]}>
      <DriverPaymentHistoryPage />
    </RouteGuard>
  );
}
