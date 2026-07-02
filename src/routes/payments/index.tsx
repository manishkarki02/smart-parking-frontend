import { createFileRoute } from "@tanstack/react-router";
import { DriverPaymentHistoryPage } from "@/features/payments/pages/DriverPaymentHistoryPage";

export const Route = createFileRoute("/payments/")({
  component: DriverPaymentHistoryPage,
});
