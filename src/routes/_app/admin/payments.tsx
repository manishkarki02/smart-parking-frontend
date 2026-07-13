import { createFileRoute } from "@tanstack/react-router";
import { AdminPaymentsPage } from "@/features/payments/pages/AdminPaymentsPage";

export const Route = createFileRoute("/_app/admin/payments")({
  component: AdminPaymentsPage,
});
