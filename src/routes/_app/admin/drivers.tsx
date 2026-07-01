import { createFileRoute } from "@tanstack/react-router";
import { AdminDriversPage } from "@/features/admin/pages/AdminDriversPage";

export const Route = createFileRoute("/_app/admin/drivers")({
  component: AdminDriversPage,
});
