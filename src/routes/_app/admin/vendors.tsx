import { createFileRoute } from "@tanstack/react-router";
import { AdminVendorsPage } from "@/features/admin/pages/AdminVendorsPage";

export const Route = createFileRoute("/_app/admin/vendors")({
  component: AdminVendorsPage,
});
